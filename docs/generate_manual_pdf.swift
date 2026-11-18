import AppKit
import CoreGraphics
import Foundation

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let html = try Data(contentsOf: input)
let options: [NSAttributedString.DocumentReadingOptionKey: Any] = [
    .documentType: NSAttributedString.DocumentType.html,
    .characterEncoding: String.Encoding.utf8.rawValue,
]
let pageWidth: CGFloat = 595.28
let pageHeight: CGFloat = 841.89
let margin: CGFloat = 48
let contentWidth = pageWidth - margin * 2
let contentHeight = pageHeight - margin * 2

let htmlText = String(data: html, encoding: .utf8) ?? ""
let style = htmlText.components(separatedBy: "<body>").first ?? ""
let sectionPattern = #"(?s)<section.*?</section>"#
let sections = try NSRegularExpression(pattern: sectionPattern).matches(in: htmlText, range: NSRange(htmlText.startIndex..., in: htmlText)).compactMap {
    Range($0.range, in: htmlText).map { String(htmlText[$0]) }
}
let fragments = sections.isEmpty ? [htmlText] : sections

guard let context = CGContext(output as CFURL, mediaBox: nil, nil) else {
    throw NSError(domain: "ManualPDF", code: 1, userInfo: [NSLocalizedDescriptionKey: "No se pudo crear el PDF"])
}

for fragment in fragments {
    let document = "\(style)<body>\(fragment)</body></html>"
    let attributed = try NSAttributedString(data: Data(document.utf8), options: options, documentAttributes: nil)
    context.beginPDFPage(nil)
    context.saveGState()
    context.translateBy(x: 0, y: pageHeight)
    context.scaleBy(x: 1, y: -1)
    let graphics = NSGraphicsContext(cgContext: context, flipped: true)
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = graphics
    attributed.draw(in: NSRect(x: margin, y: margin, width: contentWidth, height: contentHeight))
    NSGraphicsContext.restoreGraphicsState()
    context.restoreGState()
    context.endPDFPage()
}
context.closePDF()
