const fs = require('fs');
const pdfParse = require('pdf-parse');


async function parsePdfToJson(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);

    try {
        const data = await pdfParse(dataBuffer);
        const rawText = data.text;

        
        const structuredData = processRawText(rawText);

        return structuredData;
    } catch (error) {
        console.error('Error parsing PDF:', error);
    }
}


function processRawText(text) {
    const lines = text.split('\n');
    const jsonData = {
        headings: [],
        paragraphs: [],
        bulletPoints: [],
        tables: []
    };

    let currentParagraph = '';

    lines.forEach(line => {
        line = line.trim();

       
        if (!line) {
          
            if (currentParagraph) {
                jsonData.paragraphs.push(currentParagraph.trim());
                currentParagraph = '';
            }
            return;
        }

        if (isHeading(line)) {
            
            jsonData.headings.push(line);
        } else if (isBulletPoint(line)) {
        
            jsonData.bulletPoints.push(line);
        } else if (isTableRow(line)) {
           
            jsonData.tables.push(line.split(/\s{2,}|\t/).map(cell => cell.trim()));
        } else {
           
            currentParagraph += line + ' ';
        }
    });

   
    if (currentParagraph) {
        jsonData.paragraphs.push(currentParagraph.trim());
    }

    return jsonData;
}


function isHeading(line) {
    return /^[A-Z\s]+$/.test(line) || line.startsWith('Chapter');
}


function isBulletPoint(line) {
    return line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./);
}


function isTableRow(line) {
    return /\t|\s{2,}/.test(line);
}


(async () => {
    const result = await parsePdfToJson('chapter_14.pdf');
    fs.writeFileSync('output.json', JSON.stringify(result, null, 2));
})();
