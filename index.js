const extract = require('pdf-text-extract')
const hummus = require('hummus')
const path = require('path')
const fs = require('fs')

const sourcePDF = path.join(__dirname, './input/engenharia.pdf')
const outputFolder = path.join(__dirname, '/output')

// function to encode file data to base64 encoded string
// function base64_encode (file) {
//   const buffer = fs.readFilec(file)

//   // convert binary data to base64 encoded string
//   return new Buffer(buffer).toString('base64')
// }

// // function to create file from base64 encoded string
// function base64_decode (base64str, fileName) {
//   fs.writeFile(fileName, base64str, 'base64', function (err) {
//     const handleMessage = err || 'The file was created!'

//     console.log(handleMessage)
//   })
// }

function deleteDuplicates () {
  fs
    .readdirSync(outputFolder)
    .filter(file => fs.unlinkSync(path.join(outputFolder, file)))
}

function splitPDF (file, employees) {
  if (typeof file !== 'string' || !Array.isArray(employees)) return false

  // Delete any files that already exist in the output folder
  deleteDuplicates()

  extract(sourcePDF, (err) => {
    if (err) {
      console.error(err)
      return false
    }

    // const base64str = base64_encode('./input/engenharia.pdf')
    // base64_decode(base64str, './output/engenharia2.pdf')

    employees.forEach(({ name, pages }) => {
      const pdfWriter = hummus.createWriter(path.join(outputFolder, `${name}.pdf`))
      const newPage = pdfWriter.createPage(0, 0, 595, 842)

      pages.forEach((page, index) => {
        page = page - 1

        if (index === 0) {
          pdfWriter.mergePDFPagesToPage(newPage, sourcePDF,
            {
              type: hummus.eRangeTypeSpecific,
              specificRanges: [
                [page, page]
              ]
            }
          )
        } else {
          pdfWriter.appendPDFPagesFromPDF(sourcePDF,
            {
              type: hummus.eRangeTypeSpecific,
              specificRanges: [
                [page, page]
              ]
            }
          )
        }
      })

      pdfWriter.writePage(newPage).end()
    })
  })
}

const payload = {
  file: 'engenharia',
  employees: [
    {
      name: 'SAMUEL ALMEIDA CARDOSO',
	    pages: [42, 43, 1]
    },
    {
      name: 'LUIZA DA ROCHA GUERRA',
      pages: [22]
    }
  ]
}

splitPDF(payload.file, payload.employees)