async function sleep(seconds) {
    return new Promise((s, j) => {
        setTimeout(() => { s(true) }, 1000 * seconds)
    })
}

module.exports = { sleep }