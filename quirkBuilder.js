const initQuirk = [
  {
    "type": "prefix",
    "prefix": "["
  },
  {
    "type": "suffix",
    "suffix": "] "
  },
  {
    "type": "simple",
    "find": " ",
    "replace": "]~["
  }
]

const optionTypes = [
  ["prefix", "suffix", "find", "regex"]
  ["replace"]
]

const helpText = {
  prefix: `<div><p>This is a string of text that will be applied at the start of the message. There can only be one prefix, so if another prefix mod is applied after this one it will be overridden. Stacking prefixes can be done using the regex mod /<span class="arg regex">^</span>/g, which will place it's replacement at the start of the string without removing anything.</p></div>`,
  suffix: `<div><p>This is a string of text that will be applied at the end of the message. There can only be one suffix, so if another suffix mod is applied after this one it will be overridden. Stacking suffixes can be done using the regex mod /<span class="arg regex">$</span>/g, which will place it's replacement at the end of the string without removing anything.</p></div>`,
  simple: `<div><p>This is a string of text that will target any point in the message that looks identical to the text, and then replace that text with the replace text below. This does not utilise regex.</p></div>`,
  regex: `<div><p>This is a regex string that will match to the message using the regex format. While the pesterchum client uses the python format, this tool uses the Javascript format, so keep that in mind if you are planning on converting your quirks. <a href="https://regexone.com/">You can learn more about <b>Reg</b>ular <b>Ex</b>pressions here.</a></p></div>`,
  replaceSimple: `<div><p>This is a string of text that will replace what is matched by the above text.</p></div>`,
  replaceRegex: `<div><p>This is a string of text that will replace what is matched by the above regex. This tool is using the javascript regex format, thus matched groups can be inserted using "$1", "$2", "$3" and so on.</p><p>There are also 3 built in functions within both this tool and the pesterchum client, "upper()", which will uppercase any text within it's brackets, "lower()", which will lowercase anything within the brackets, and "scamble()", which will randomly reorder the characters within the brackets.</p></div>`,
  replaceRandom: `<div><p>This is a list of strings of text seperated by commas [,] that will randomly chosen to be replace what is matched by the above regex. A backslash before a comma [\\,] will not split the string. This tool is using the javascript regex format, thus matched groups can be inserted using "$1", "$2", "$3" and so on.</p><p>There are also 3 built in functions within both this tool and the pesterchum client, "upper()", which will uppercase any text within it's brackets, "lower()", which will lowercase anything within the brackets, and "scamble()", which will randomly reorder the characters within the brackets.</p></div>`
}

let savedQuirks = {
  "Default": {
    "color": "#000000",
    "handle": "",
    "quirk": [
      {
        "type": "prefix",
        "prefix": "["
      },
      {
        "type": "suffix",
        "suffix": "]"
      },
      {
        "type": "simple",
        "find": " ",
        "replace": "]~["
      }
    ]
  }
}

if (localStorage.getItem("savedQuirks")) savedQuirks = JSON.parse(localStorage.getItem("savedQuirks"))
else localStorage.setItem("savedQuirks", JSON.stringify(savedQuirks))

let currentQuirk = initQuirk

// TEST QUIRK
const updateColor = () => {
  document.body.style.setProperty("--quirkCol", document.getElementById("textColor").value)
}

const processTest = () => {
  let text = document.getElementById("testinput").value
  const handle = document.getElementById("textHandle").value

  if (text) text = processQuirk(text, currentQuirk)
  if (text && handle) text = handle + ": " + text.replace(/\n/g, "\n" + handle + ": ")

  document.getElementById("testoutput").innerText = text
}

const processQuirk = (text, quirk) => {
  let prefix = ""
  let suffix = ""

  quirk.forEach(mod => {

    let type = mod.type

    if (mod.condition) {
      const reg = new RegExp(mod.condition, "g")
      if (!reg.test(text)) type = "invalid"
    }
    
    switch (type) {
      case "prefix":
        prefix = mod.prefix
        break;
      case "suffix":
        suffix = mod.suffix
        break;
      case "simple":
        text = processExtra(text.split(mod.find).join(mod.replace))
        break;
      case "regex":
        const regex = new RegExp(mod.regex, "g")
        text = processExtra(text.replace(regex, mod.replace))
        break;
      case "random":
        const randomRegex = new RegExp(mod.regex, "g")
        const randomRegexNoGroups = new RegExp(mod.regex.replace(/([^\\]|^)[()]+/g, "$1"), "g")

        const matches = [... text.matchAll(randomRegex)]
        let splitText = text.split(randomRegexNoGroups)
        let joinedText = splitText.shift()

        matches.forEach((e, i) => {
          const replace = mod.replaces[Math.floor(Math.random() * mod.replaces.length)]
          const replacedJoin = processExtra(e[0].replace(randomRegex, replace))
          joinedText += replacedJoin + splitText.shift()
        })

        text = joinedText

        break;
      default:
        break;
    }

  });
  
  return prefix + text + suffix
}

const processExtra = text => {
  text = text.replace(/upper\((.*?)\)/g, (m, p1) => p1.toUpperCase())
  text = text.replace(/lower\((.*?)\)/g, (m, p1) => p1.toLowerCase())
  text = text.replace(/scramble\((.*?)\)/g, (m, p1) => shuffle(p1.split("")).join(""))

  return text
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const shuffle = array => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Load modifiers

let loadModifiers = quirk => {
  const modWrap = document.getElementById("mods")
  modWrap.innerHTML = ""

  quirk.forEach((mod, i) => {
    const div = document.createElement("div")
    const info = document.createElement("div")
    const acts = document.createElement("div")

    acts.className = "modActs"
    info.className = "modInfo"

    div.dataset.quirkindex = i

    // Info
    info.className = "info"
    info.innerHTML = `<h3>${mod.type}</h3>`

    switch (mod.type) {
      case "prefix":
        info.innerHTML += `<div>Prefix: "<span class="arg prefix">${mod.prefix}</span>"</div>`
        break;
      case "suffix":
        info.innerHTML += `<div>Suffix: "<span class="arg suffix">${mod.suffix}</span>"</div>`
        break;
      case "simple":
        info.innerHTML += `<div>Find: "<span class="arg find">${mod.find}</span>"</div><div>Replace: "<span class="arg replace">${mod.replace}</span>"</div>`
        break;
      case "regex":
        info.innerHTML += `<div>Regex: /<span class="arg regex">${mod.regex}</span>/g</div><div>Replace: "<span class="arg regexreplace">${mod.replace}</span>"</div>`
        break;
      case "random":
        info.innerHTML += `<div>Regex: /<span class="arg random">${mod.regex}</span>/g</div>`
        let replaces = `Random replaces: `
        mod.replaces.forEach((e, i) => {
          // info.innerHTML += `<div>"<span class="arg randomreplace">${e}</span>"</div>`
          replaces += `"<span class="arg randomreplace">${e}</span>", `
        })
        info.innerHTML += `<div>${replaces.slice(0, -2)}</div>`
        break;
      default:
        break;
    }

    if (mod.condition) {
      info.innerHTML += `<div>Condition: /<span class="arg condition">${mod.condition}</span>/g</div>`
    }

    // Acts
    // DELETE
    const del = document.createElement("button")
    del.className = "delete"
    del.innerHTML = "🗑️"
    del.onclick = () => {
      currentQuirk.splice(i, 1)
      loadModifiers(currentQuirk)
    }
    acts.appendChild(del)

    // EDIT
    const edit = document.createElement("button")
    edit.className = "edit"
    edit.innerHTML = "✏️"
    edit.onclick = () => {
      openModal(mod.type, i)
    }
    acts.appendChild(edit)

    // UP
    if (i != 0) {
      const up = document.createElement("button")
      up.className = "up"
      up.innerHTML = "⬆️"
      up.onclick = () => {
        [currentQuirk[i], currentQuirk[i - 1]] = [currentQuirk[i - 1], currentQuirk[i]];
        loadModifiers(currentQuirk)
      }
      acts.appendChild(up)
    }

    // DOWN
    if (i != quirk.length - 1) {
      const down = document.createElement("button")
      down.className = "down"
      down.innerHTML = "⬇️"
      down.onclick = () => {
        [currentQuirk[i], currentQuirk[i + 1]] = [currentQuirk[i + 1], currentQuirk[i]];
        loadModifiers(currentQuirk)
      }
      acts.appendChild(down)
    }


    div.appendChild(info)
    div.appendChild(acts)
    modWrap.appendChild(div)
  })

  processTest()
}

loadModifiers(currentQuirk)

// MODAL

const openModal = (type, modIndex) => {
  console.log(type)
  const modal = document.querySelector("dialog.modal")

  const [label1, label2] = [modal.querySelector("label[for=op1]"), modal.querySelector("label[for=op2]")]
  const [help1, help2] = [modal.querySelector(".option1 .helpDialogue"), modal.querySelector(".option2 .helpDialogue")]

  modal.showModal()

  // Edit modal text
  modal.dataset.type = type
  modal.querySelector("h2").innerText = type
  if (type != "prefix" && type != "suffix") {
    modal.querySelector("h2").innerText += " replace"
    modal.querySelector(".option2").style.display = "block"
  } else {
    modal.querySelector(".option2").style.display = "none"
  }

  switch (type) {
    case "prefix":
      label1.innerText = "Prefix text:"
      help1.innerHTML = helpText.prefix
      break;
    case "suffix":
      label1.innerText = "Suffix text:"
      help1.innerHTML = helpText.suffix
      break;
    case "simple":
      label1.innerText = "Find text:"
      label2.innerText = "Replace text:"
      help1.innerHTML = helpText.simple
      help2.innerHTML = helpText.replaceSimple
      break;
    case "regex":
      label1.innerText = "Find regex:"
      label2.innerText = "Replace regex:"
      help1.innerHTML = helpText.regex
      help2.innerHTML = helpText.replaceRegex
      break;
    case "random":
      label1.innerText = "Find regex:"
      label2.innerText = "Random regex:"
      help1.innerHTML = helpText.regex
      help2.innerHTML = helpText.replaceRandom
      break;
    default:
      break;
  }

  // Fill modal
  const inputs = modal.querySelectorAll("input")
  if (isNaN(modIndex)) {
    
    // Leave everything blank
    inputs.forEach(e => { e.value = "" })

    modal.dataset.modIndex = "new"

  } else {

    let mod = currentQuirk[modIndex]
    
    if (mod.prefix) inputs[0].value = mod.prefix
    if (mod.suffix) inputs[0].value = mod.suffix
    if (mod.find) inputs[0].value = mod.find
    if (mod.regex) inputs[0].value = mod.regex
    if (mod.replace) inputs[1].value = mod.replace
    if (mod.replaces) inputs[1].value = mod.replaces.join()
    if (mod.condition) inputs[2].value = mod.condition

    modal.dataset.modIndex = modIndex

  }

}

// MODAL BUTTONS
document.querySelector("button.cancel").onclick = () => { document.querySelector(".modal").close() }
document.querySelectorAll("#adders button").forEach(e => {
  e.onclick = () => {
    openModal(e.dataset.type)
  }
})
document.querySelector("button.save").onclick = () => {

  // Generate quirk mod
  const type = document.querySelector("dialog.modal").dataset.type
  const mod = {
    type: type
  }

  const op1 = document.querySelector("dialog.modal #op1").value
  const op2 = document.querySelector("dialog.modal #op2").value
  const condition = document.querySelector("dialog.modal #opC").value

  switch (type) {
    case "prefix":
      mod.prefix = op1
      break;
    case "suffix":
      mod.suffix = op1
      break;
    case "simple":
      mod.find = op1
      mod.replace = op2
      break;
    case "regex":
      mod.regex = op1
      mod.replace = op2
      break;
    case "random":
      mod.regex = op1
      mod.replaces = op2.replace(/\\,/g, "%KARAISKOOL%").split(",").map(text => text.replace(/%KARAISKOOL%/g, ","))
      break;
    default:
      break;
  }

  if (condition) mod.condition = condition

  // Add mod to current qurik
  const modIndex = document.querySelector("dialog.modal").dataset.modIndex
  if (modIndex == "new") {
    currentQuirk.push(mod)
  } else {
    currentQuirk[modIndex] = mod
  }

  // Reload and reset
  loadModifiers(currentQuirk)
  document.querySelector(".modal").close()
  processTest()
}

document.querySelectorAll(".helpButton").forEach(e => {
  e.onclick = () => { e.parentNode.querySelector("dialog").showModal() }
})
document.querySelectorAll(".helpDialogue").forEach(e => {
  e.onclick = () => { e.parentNode.querySelector("dialog").close() }
})


// LOAD SAVED
const loadSavedQuirks = (divId, quirks) => {
  const div = document.getElementById(divId)
  div.innerHTML = ""

  for (const [name, quirk] of Object.entries(quirks)) {
    const button = document.createElement("button")
    button.style.backgroundColor = quirk.color
    button.innerText = name
    button.onclick = () => {
      currentQuirk = JSON.parse(JSON.stringify(quirk.quirk))
      document.getElementById("textColor").value = quirk.color
      document.getElementById("textHandle").value = quirk.handle ? quirk.handle : ""
      updateColor()
      loadModifiers(currentQuirk)
    }

    div.appendChild(button)
  }

  document.getElementById("export").value = JSON.stringify(savedQuirks)
}

const saveQuirk = () => {
  if (!document.getElementById("saveQuirkName").value) return

  if (JSON.stringify(currentQuirk) == "[]") {
    delete savedQuirks[document.getElementById("saveQuirkName").value]
  } else {
    savedQuirks[document.getElementById("saveQuirkName").value] = {
      handle: document.getElementById("textHandle").value,
      color: document.getElementById("textColor").value,
      quirk: currentQuirk
    }
  }

  localStorage.setItem("savedQuirks", JSON.stringify(savedQuirks))
  loadSavedQuirks("loadedquirks", savedQuirks)
  document.getElementById("saveQuirkName").value = ""
}

const importQuirks = () => {
  const newQuirks = JSON.parse(document.getElementById("import").value)

  savedQuirks = newQuirks
  localStorage.setItem("savedQuirks", JSON.stringify(savedQuirks))
  loadSavedQuirks("loadedquirks", savedQuirks)
}

fetch("homestuckQuirks.json").then(response => response.json()).then(json => loadSavedQuirks("presets", json));
loadSavedQuirks("loadedquirks", savedQuirks)
processTest()
updateColor()