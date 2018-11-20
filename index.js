const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const extract = require('pdf-text-extract')
const hummus = require('hummus')
const path = require('path')
const fs = require('fs')

const sourcePDF = path.join(__dirname, './input/engenharia.pdf')
const outputFolder = path.join(__dirname, '/output')

const app = new Koa()
const router = new Router()

app.use(bodyParser())

// error handling
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
    ctx.app.emit('error', err, ctx)
  }
})

// // function to encode file data to base64 encoded string
// function base64_encode (file) {
//   const buffer = fs.readFileSync(file)

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

function match (word, words) {
  const matches = word ? words.split(word).length - 1 : 0

  return !!matches
}

router.post('/split-pdf', async ctx => {
  const { file, names } = ctx.request.body

  if (typeof file !== 'string' || !Array.isArray(names)) return false

  // Delete any files that already exist in the output folder
  deleteDuplicates()

  // Pages will be an array of strings.
  // Each item corresponds to a page in the PDF
  extract(sourcePDF, (err, pages) => {
    if (err) {
      console.error(err)
      return false
    }

    names.forEach(name => {
      const employeeIndex = pages.findIndex(item => match(name, item))

      const pdfWriter = hummus.createWriter(path.join(outputFolder, `${name}.pdf`))

      const page = pdfWriter.createPage(0,0,595,842)

      pdfWriter.mergePDFPagesToPage(page,
        sourcePDF,
        {
          type: hummus.eRangeTypeSpecific,
          specificRanges: [
            [employeeIndex, employeeIndex]
          ]
        })

      pdfWriter.writePage(page).end()
    })
  })

  // const base64str = base64_encode('./engenharia.pdf')

  // base64_decode(base64str, './output/engenharia2.pdf')

  ctx.type = { 'Content-Type': 'application/octet-stream' }
  ctx.status = 200
  ctx.body = { status: 'success', data: 'coe' }
})

app.use(router.routes())

const server = app.listen(3000)

module.exports = server

