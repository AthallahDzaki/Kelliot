const brainly = require('brainly-scraper')

module.exports = BrainlySearch = (pertanyaan, jumlah) => {
  return new Promise( (resolve, reject) => {
    brainly(pertanyaan.toString(),Number(jumlah)).then((res) => {
        let brainlyResult = []
        res.data.forEach((ask) => {
            let opt = {
                pertanyaan: ask.pertanyaan,
                fotoPertanyaan: ask.questionMedia
            }
            ask.jawaban.forEach(answer => {
                opt.jawaban = {
                    judulJawaban: answer.text,
                    fotoJawaban: answer.media
                }
            })
            brainlyResult.push(opt)
            })
            return brainlyResult
    }).then(x => {
        resolve(x)
    }).catch(err => {
        reject(err);
    })
  })
}
