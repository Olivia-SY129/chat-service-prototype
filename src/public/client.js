// @ts-check

// IIFE
;(() => {
  const socket = new WebSocket(`ws://${window.location.host}/ws`)

  const $chats = document.getElementById('messages')
  const $form = document.getElementById('form')
  /** @type {HTMLInputElement | null} */
  // @ts-ignore
  const $input = document.getElementById('input')

  if (!$form || !$input || !$chats) {
    throw new Error('Init failed!')
  }

  /**
   * @typedef Chats
   * @property {string} nickname
   * @property {string} message
   */

  /**
   * @type {Chats[]}
   */
  const chats = []

  const adjectives = [
    '적극적인',
    '청순한',
    '친절한',
    '호기심이 강한',
    '우아한',
    '잘생긴',
  ]

  const animals = ['판다', '오징어', '호랑이', '여우', '고양이', '메기']

  /**
   *
   * @param {string[]} arr
   * @returns {string}
   */
  function pickRandom(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length)
    const randomString = arr[randomIndex]

    if (!randomString) throw new Error('Array length is 0')

    return randomString
  }

  const myNickname = `${pickRandom(adjectives)} ${pickRandom(animals)}`

  $form.addEventListener('submit', (e) => {
    e.preventDefault()
    socket.send(
      JSON.stringify({
        nickname: myNickname,
        message: $input.value,
      })
    )
    $input.value = ''
  })

  // socket.addEventListener('open', () => {
  //   socket.send('Hello, sever!')
  // })

  function renderChats() {
    $chats.innerHTML = ''

    chats.forEach(({ nickname, message }) => {
      const div = document.createElement('div')
      div.innerText = `${nickname}: ${message}`
      $chats.appendChild(div)
    })
  }

  socket.addEventListener('message', (e) => {
    // console.log(e.data)
    if (typeof e?.data !== 'string') return
    const { type, payload } = JSON.parse(e.data)

    if (type === 'sync') {
      const { chats: syncedChats } = payload
      chats.push(...syncedChats)
    } else if (type === 'chat') {
      const chat = payload
      chats.push(chat)
    }

    renderChats()
  })
})()
