#!/bin/sh
# Generate individual case study pages from a template

TEMPLATE="case-study-template.html"
OUTPUT_DIR="."

# List of case studies: slug|title|description|image_url
CASE_STUDIES="
3p|3P: People Processing Plastic|An Experiment in Plastic Reuse and Recycling: Passionate people performing practical plastic processing, producing prized products, preventing pollution proliferation, and progressing a pristine planet|./3Plogo.png
spontaneous-lamp|Spontaneous Lamp|Designing with found materials; a lamp that doesn't exist? Foraged Bamboo, found rocks, unused 5 gallon bucket, clip-on lamp, and extension cord.|https://assets.mica.edu/files/resources/thumb_classic_med_bjornard_kristian_spontaneouslamp3.jpg
slash|Slash: MICA Graduate 2022 Program Guide|Is less really more? We're using fewer pages, minimal ink coverage, and more succinct content to find out!|https://live.staticflickr.com/65535/52467753725_83a94e0906_c.jpg
mica-grad-admissions|MICA Grad Admissions Mailer|Public domain imagery, open source typefaces, and clever printing tricks combine…|https://live.staticflickr.com/65535/51367350256_a3209269dc_c.jpg
carbon-sequestering-book|A Carbon Sequestering Book|What if a book could draw down carbon from the air?|https://live.staticflickr.com/65535/51368358350_fa4e139cc3_c.jpg
ecovention-europe|Ecovention Europe|Can \"Reduce\" and \"Reuse\" be used as visually and conceptually meaningful design constraints?|https://live.staticflickr.com/65535/51367350236_6ad27412ca_c.jpg
green-acres|Green Acres|How to represent sustainably focused artists and maintain a visually inventive book while avoiding tired \"green design\" clichés?|https://live.staticflickr.com/7404/9055685895_34d9e39f20_c.jpg
sustainabilitist-principles|The Sustainabilitist Principles|What ways of thinking lead a designer to sustainable solutions?|https://live.staticflickr.com/65535/51367568813_9a30354224_z.jpg
rise-of-climate-designer|The Rise of the Climate Designer: Lecture Poster|Do you need new materials and CMYK printing? Two color risograph on found paper.|https://live.staticflickr.com/65535/51367350506_b46c17e48b_c.jpg
chesapeake-farm-to-table|Chesapeake Farm to Table|How do you visualize novel connections between local farmers and their nearby restaurant and home kitchens?|https://live.staticflickr.com/65535/51367350056_c0d16b613b_c.jpg
five-seeds-farm|Five Seeds Farm & Apiary|What kind of website does an Urban Farm need?|https://live.staticflickr.com/65535/51368358315_b1c05c74ce_c.jpg
"

echo "$CASE_STUDIES" | while IFS='|' read -r slug title description image; do
  if [ -n "$slug" ]; then
    output_file="$OUTPUT_DIR/case-study-$slug.html"
    sed "s|{{TITLE}}|$title|g; s|{{DESCRIPTION}}|$description|g; s|{{IMAGE}}|$image|g; s|{{SLUG}}|$slug|g" "$TEMPLATE" > "$output_file"
    echo "Generated $output_file"
  fi
done