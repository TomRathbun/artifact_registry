import sys
import re

with open('frontend/src/components/ArtifactListView.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Find the handleExportWord function
# It starts at: const handleExportWord = async () => {
# and ends when deleteMutation starts

start_match = re.search(r'    const handleExportWord = async \(\) => \{', text)
if not start_match:
    print('Failed to find handleExportWord start')
    sys.exit(1)

end_match = re.search(r'    const deleteMutation = useMutation\(\{', text)
if not end_match:
    print('Failed to find deleteMutation start')
    sys.exit(1)

word_export_code = text[start_match.start():end_match.start()]

# Create the PDF export code
pdf_export_code = word_export_code.replace('const handleExportWord = async () => {', 'const handleExportPdf = async () => {')

# 1. Modify the window open synchronous trick
pdf_export_code = pdf_export_code.replace('''const filteredArtifacts = filteredResults;
        if (!filteredArtifacts || filteredArtifacts.length === 0) return;''',
'''const filteredArtifacts = filteredResults;
        if (!filteredArtifacts || filteredArtifacts.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups for this website to export to PDF.');
            return;
        }
        printWindow.document.write('<html><head><title>Loading PDF...</title></head><body><h2>Preparing PDF export...</h2></body></html>');
        printWindow.document.close();''')

# 2. Modify page-break renderer for code
pdf_export_code = pdf_export_code.replace('<table style=\"width: 100%; border-collapse: collapse; margin-bottom: 15px; background-color: #f8f9fa; border: 1px solid #e9ecef;\">',
    '<table style=\"width: 100%; border-collapse: collapse; margin-bottom: 15px; background-color: #f8f9fa; border: 1px solid #e9ecef; page-break-inside: avoid;\">')

# 3. Replace HTML head
header_start = """        let content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>${artifactType} Export</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                    h2 { color: #34495e; margin-top: 30px; border-bottom: 1px solid #eee; }
                    h3 { color: #7f8c8d; margin-top: 20px; }
                    .meta { color: #666; font-size: 0.9em; margin-bottom: 15px; font-style: italic; }
                    blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #555; margin: 15px 0; }
                    ul, ol { margin-bottom: 15px; }
                    li { margin-bottom: 5px; }
                    .rationale { background: #f9f9f9; padding: 10px; border-radius: 4px; font-size: 0.9em; }
                    img { width: 100%; max-width: 100%; height: auto; display: block; margin: 10px 0; border: 1px solid #eee; }
                </style>
            </head>
            <body>
            <h1>${artifactType.charAt(0).toUpperCase() + artifactType.slice(1)} Export</h1>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <hr/>
        `;"""


pdf_header = """        let content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${artifactType} Export</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; color: #333; max-width: 800px; margin: 0 auto; }
                    h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                    h2 { color: #34495e; margin-top: 30px; border-bottom: 1px solid #eee; page-break-after: avoid; }
                    h3 { color: #7f8c8d; margin-top: 20px; page-break-after: avoid; }
                    hr { border: 0; border-top: 1px solid #eee; margin: 30px 0; }
                    img { max-width: 100%; height: auto; page-break-inside: avoid; }
                    table { border-collapse: collapse; page-break-inside: avoid; }
                    table td, table th { border: 1px solid #ddd; padding: 8px; }
                    blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #555; margin: 15px 0; page-break-inside: avoid; }
                    .meta { color: #666; font-size: 0.9em; margin-bottom: 15px; font-style: italic; }
                    .rationale { background: #f9f9f9; padding: 10px; border-radius: 4px; font-size: 0.9em; }
                    @media print {
                        body { padding: 0; max-width: none; background: white; }
                        @page { margin: 1.5cm; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; float: right; margin-bottom: 20px;">Print / Save as PDF</button>
            <h1>${artifactType.charAt(0).toUpperCase() + artifactType.slice(1)} Export</h1>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <hr style="clear: both;" />
        `;"""

pdf_export_code = pdf_export_code.replace(header_start, pdf_header)

# 4. Modify saving blob
blob_saving_code = """        content += `</body></html>`;
        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${artifactType}_export_${new Date().toISOString().split('T')[0]}.doc`;
        link.click();
        URL.revokeObjectURL(url);
    };"""

pdf_blob_code = """        content += `</body></html>`;
        printWindow.document.open();
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        };
    };"""

pdf_export_code = pdf_export_code.replace(blob_saving_code, pdf_blob_code)

if pdf_export_code == word_export_code:
    print('Failed to modify generated code.')
    sys.exit(1)

import_check = pdf_export_code.find('const blob = new Blob')
if import_check != -1:
    print('Blob saving code not fully replaced!')

text = text[:end_match.start()] + pdf_export_code + '\n' + text[end_match.start():]

# 5. Add PDF Button
buttons_code = """                        <button
                            onClick={handleExportWord}
                            disabled={!artifacts || artifacts.length === 0}
                            className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Export Word"
                        >
                            <Download className="w-4 h-4" />
                            DOC
                        </button>
                        <button
                            onClick={handleCopyAsTable}"""

new_buttons_code = """                        <button
                            onClick={handleExportWord}
                            disabled={!artifacts || artifacts.length === 0}
                            className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Export Word"
                        >
                            <Download className="w-4 h-4" />
                            DOC
                        </button>
                        <button
                            onClick={handleExportPdf}
                            disabled={!artifacts || artifacts.length === 0}
                            className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Export PDF"
                        >
                            <Download className="w-4 h-4" />
                            PDF
                        </button>
                        <button
                            onClick={handleCopyAsTable}"""

text = text.replace(buttons_code, new_buttons_code)

with open('frontend/src/components/ArtifactListView.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Successfully duplicated and inserted handleExportPdf')
