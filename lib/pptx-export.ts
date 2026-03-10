import pptxgen from "pptxgenjs";

interface Slide {
    slide_number: number;
    title: string;
    content: string[];
    speaker_notes: string;
    visual_suggestion: string;
    layout_type: string;
    image_prompt: string;
}

export async function exportToPPTX(slides: Slide[], title: string = "Sunum") {
    let pres = new pptxgen();

    pres.layout = "LAYOUT_16x9";
    pres.title = title;

    slides.forEach((slide) => {
        let pptSlide = pres.addSlide();

        // Add Title
        pptSlide.addText(slide.title, {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 1,
            fontSize: 32,
            bold: true,
            color: "363636",
            align: pres.AlignH.left,
        });

        // Add Content Points
        slide.content.forEach((point, idx) => {
            pptSlide.addText(point, {
                x: 0.7,
                y: 1.8 + (idx * 0.6),
                w: 6,
                h: 0.5,
                fontSize: 18,
                color: "666666",
                bullet: true,
            });
        });

        // Add Speaker Notes
        if (slide.speaker_notes) {
            pptSlide.addNotes(slide.speaker_notes);
        }

        // Add Visual Suggestion as a small text box on bottom right
        pptSlide.addText(`Görsel Önerisi: ${slide.visual_suggestion}`, {
            x: 0.5,
            y: 5.0,
            w: 9,
            h: 0.5,
            fontSize: 10,
            italic: true,
            color: "999999",
            align: pres.AlignH.left,
        });
    });

    return pres.writeFile({ fileName: `${title.substring(0, 30)}.pptx` });
}
