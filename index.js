const extract = require('pdf-text-extract')
const hummus = require('hummus')
const path = require('path')
const fs = require('fs')

const sourcePDF = path.join(__dirname, './input/engenharia.pdf')
const outputFolder = path.join(__dirname, '/output')
const tempPDF = path.join(__dirname, './temp.pdf')

// function to encode file data to base64 encoded string
function base64_encode (file) {
  const buffer = fs.readFileSync(file)

  // convert binary data to base64 encoded string
  return new Buffer.from(buffer).toString('base64')
}

// // function to create file from base64 encoded string
function base64_decode (base64str) {
  fs.writeFile('temp.pdf', base64str, 'base64', err => err && console.log(err))
}

// Delete any files that already exist in folder
function deleteDuplicates (folder) {
  fs
    .readdirSync(folder)
    .filter(file => fs.unlinkSync(path.join(folder, file)))
}

function splitPDF (file, employees) {
  if (typeof file !== 'string' || !Array.isArray(employees)) {
    console.log('erro mané')
    return false
  }

  deleteDuplicates(outputFolder)

  extract(tempPDF, (err) => {
    if (err) {
      console.error(err)
      return false
    }

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

    // remove temp.pdf file
    fs.unlinkSync(path.join(__dirname, 'temp.pdf'))
  })
}

const payload = {
  file: base64_encode(sourcePDF),
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

base64_decode(payload.file)

splitPDF(payload.file, payload.employees)
