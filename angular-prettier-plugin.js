const { parsers, util: { parse } } = require('prettier');

// Function to determine if an element has children
const hasChildren = (node) => {
    return node.children && node.children.length > 0;
};

// Function to format HTML according to the specified rules
const customFormat = (text) => {
    const lines = text.split('\n');
    const formattedLines = [];

    lines.forEach(line => {
        const trimmedLine = line.trim();
        const isOpeningTag = trimmedLine.match(/^<\w+/);
        const isClosingTag = trimmedLine.match(/^<\/\w+/);
        
        if (isOpeningTag) {
            // Check if the tag has children
            const isSelfClosing = trimmedLine.endsWith('/>');
            const nodeName = trimmedLine.match(/^<(\w+)/)[1];
            const attributes = trimmedLine.slice(trimmedLine.indexOf(' ') + 1).replace('>', '').trim();

            if (hasChildren({ children: line.includes(`</${nodeName}>`) ? [] : [] }) && !isSelfClosing) {
                // Double indent for attributes if the element has children
                formattedLines.push(trimmedLine.replace(/\s+/g, ' ').replace(/^/g, '  '));
            } else {
                // Single indent for attributes if the element has no children
                formattedLines.push(trimmedLine.replace(/\s+/g, ' ').replace(/^/g, ' '));
            }
        } else if (isClosingTag) {
            const tagName = trimmedLine.match(/<\/(\w+)/)[1];
            const openingTagLineIndex = formattedLines.lastIndexOf(formattedLines.find(l => l.includes(`<${tagName}`)));

            if (openingTagLineIndex !== -1) {
                const openingTagLine = formattedLines[openingTagLineIndex];
                const indent = openingTagLine.match(/^\s*/)[0]; // Get indent of opening tag
                formattedLines.push(`${indent}</${tagName}>`); // Align closing tag with opening tag
            } else {
                formattedLines.push(line); // Keep line unchanged if opening tag not found
            }
        } else {
            formattedLines.push(line); // Keep other lines unchanged
        }
    });

    return formattedLines.join('\n');
};

// Prettier plugin
module.exports = {
    languages: [
        {
            name: "HTML",
            parsers: ["angular"],
            extensions: [".html"],
        },
    ],
    parsers: {
        angular: {
            parse,
            astFormat: "angular",
        },
    },
    printers: {
        angular: {
            print: (path) => {
                const node = path.getValue();
                return customFormat(node.content);
            },
        },
    },
};
