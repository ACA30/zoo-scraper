const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

const url = "https://www.aza.org/find-a-zoo-or-aquarium"

axios
  .get(url)
  .then((response) => {
    // Log the HTTP status code
    console.log("Status Code:", response.status)

    const html = response.data
    const $ = cheerio.load(html)
    const zoos = []

    // Select all divs with the class "column" and no other classes
    const columns = $("div.column").filter(function () {
      return $(this).attr("class") === "column"
    })

    // Log the length of the columns to ensure they are selected
    console.log("Number of columns:", columns.length)

    // Iterate over each column div
    columns.each((index, element) => {
      const nameTag = $(element).find("a")
      if (nameTag.length > 0) {
        const name = nameTag.text().trim()
        const link = nameTag.attr("href")
        const fullText = $(element).text()
        const location =
          fullText.split(",")[1]?.split("Accredited")[0].trim() || "Location not found"
        const accreditation =
          fullText.split("Accredited through ")[1]?.trim() || "Accreditation date not found"

        zoos.push({
          name: name,
          link: link,
          location: location,
          accreditation: accreditation,
        })
      } else {
        // Output the HTML code of the column for debugging
        console.warn(`No nameTag found for column ${index}`)
        console.log("HTML of the column:", $.html(element))
      }
    })

    // Save the data to a JSON file
    fs.writeFileSync("data/aza-zoos.json", JSON.stringify(zoos, null, 4))
    console.log("Data has been scraped and saved to data/aza-zoos.json")
  })
  .catch((error) => {
    console.error("Error fetching the URL:", error)
  })
