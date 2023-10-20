/** BUTTON FORMAT CLASS */
// Untuk pemformatan tombol
const MarkupFunction = {}

MarkupFunction.buildKeyboard = (buttons, options) => {
  const result = []
  if (!Array.isArray(buttons)) {
    return result
  }
  if (buttons.find(Array.isArray)) {
    return buttons.map(row => row.filter((button) => !button.hide))
  }
  const wrapFn = options.wrap
    ? options.wrap
    : (btn, index, currentRow) => currentRow.length >= options.columns
  let currentRow = []
  let index = 0
  for (const btn of buttons.filter((button) => !button.hide)) {
    if (wrapFn(btn, index, currentRow) && currentRow.length > 0) {
      result.push(currentRow)
      currentRow = []
    }
    currentRow.push(btn)
    index++
  }
  if (currentRow.length > 0) {
    result.push(currentRow)
  }
  return result
}

class Markup {
  inlineKeyboard(buttons, options) {
    const keyboard = MarkupFunction.buildKeyboard(buttons, { columns: buttons.length, ...options })
    if (keyboard && keyboard.length > 0) {
      this.inline_keyboard = keyboard
    }
    return this
  }
}

class Button {
  text(text, data, hide = false) {
    return { text, callback_data: data, hide }
  }

  url(text, url, hide = false) {
    return { text, url, hide }
  }

  webApp(text, link, hide = false) {
    return { text, web_app: { url: link }, hide }
  }
}

const markup = new Markup();
const btn = new Button();

module.exports = { markup, btn }