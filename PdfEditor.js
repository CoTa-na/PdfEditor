import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import "./App.css";

export default function PdfEditor() {
    const [pdfFile, setPdfFile] = useState(null);
    const [pageRange, setPageRange] = useState("");
    const [totalPages, setTotalPages] = useState(null);

    // ファイル選択
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);

            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = async () => {
                const pdfBytes = fileReader.result;
                const pdfDoc = await PDFDocument.load(pdfBytes);
                setTotalPages(pdfDoc.getPageCount());
            };
        } else {
            alert("PDFファイルを選択してください");
        }
    };

    // ページ削除処理
    const handleDeletePages = async () => {
        if (!pdfFile || !pageRange) {
            alert("PDFを選択し、削除するページ範囲を入力してください");
            return;
        }

        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(pdfFile);
        fileReader.onload = async () => {
            const pdfBytes = fileReader.result;
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const totalPages = pdfDoc.getPageCount();

            // 入力されたページ範囲を解析
            const [start, end] = pageRange.split("-").map(Number);
            if (isNaN(start) || isNaN(end) || start >= end || start < 1 || end > totalPages) {
                alert("ページ範囲は 1 〜 " + totalPages + " で指定してください");
                return;
            }

            // 削除対象のページを取得
            const pagesToRemove = Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
            pagesToRemove.reverse().forEach(pageIndex => {
                pdfDoc.removePage(pageIndex);
            });

            // 新しいPDFを作成
            const modifiedPdfBytes = await pdfDoc.save();
            const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });

            saveAs(blob, "modified.pdf");
            alert("処理完了: PDFをダウンロードしました！");
        };
    };

    return (
        <div className="container">
            <h2>PDF ページ削除ツール</h2>
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            {totalPages && <p className="total-pages">総ページ数: {totalPages}</p>}
            <br />
            <input
                type="text"
                placeholder="削除ページ範囲 (例: 2-4)"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
            />
            <br />
            <button onClick={handleDeletePages}>ページを削除してPDFをダウンロード</button>
        </div>
    );
}
