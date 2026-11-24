import './style.css'
import cards from './cards.json'
type Card = (typeof cards)[number]
type Piece = {text: string, className: string | null}
type Rule = {terms: string[], className: string, perTerm?: boolean}
type Match = {start: number, end: number, text: string, className: string}

const KEYWORDS = [
  'Treasure Hoard', 'Treasure Find', 'Farewell', 'Hunt',
  'Quest', 'Ranged', 'Recruit', 'Sneak', 'Supersweet'
]
const RARITIES = [
  'Common', 'Uncommon', 'Rare', 'Epic','Legendary', 'Red', 'Yellow', 'Blue'
]
const TYPES = [
  'Pirate', 'Fae', 'Dragon', 'Hero', 'Villain', 
  'Animal', 'Mage', 'Toy', 'All', 'Celestial'
]
const NAMES = cards.map(card => card.name)

const rules: Rule[] = [
  { terms: NAMES, className: 'name' },
  { terms: KEYWORDS, className: 'keyword' },
  { terms: RARITIES, className: 'rarity', perTerm: true },
  { terms: TYPES, className: 'type', perTerm: true }
]

const cardsCopy = [...cards]
const deckCards: Card[] = []

const shop = document.querySelector('#shop')
const deck = document.querySelector('#deck')
const info = document.querySelector('#info')
if (!shop || !deck || !info) {throw new Error('Something is missing')}
  
const shopSize = 3


// generate list of shop cards
const randShop = (shopSize: number, exclusions: Card[]) => {
  const cardsCopy2 = [...cardsCopy].filter(card => !exclusions.includes(card))
  const shopCards = []
  for(let x = 0; x < shopSize; x++){
    if (cardsCopy2.length === 0) {break}
    const i = Math.floor(Math.random() * cardsCopy2.length)
    shopCards.push(cardsCopy2.splice(i, 1)[0])
  }
  return shopCards
}

// generic card element
const newCard = (card: Card) => {
  const el = document.createElement('button')
  el.classList.add('card')
  const img = document.createElement('img')
  img.src = card.image
  img.alt = card.name
  el.append(img)
  el.addEventListener('mouseenter', () => {
    drawCardInfo(card)
  })
  el.addEventListener('mouseleave', () => {
    drawCardInfo(null)
  })
  return el
}

const drawShop = (shopCards: Card[]) => {
  shop.replaceChildren()
  for(const card of shopCards){
    // preload next shop to cache imgs
    const nextShopCards: Card[] = randShop(shopSize, [card])
    for (const nextCard of nextShopCards) {
      const img = new Image()
      img.src = nextCard.image
    }
    // creates card and makes click add to deck and redraw
    const el = newCard(card)
    el.addEventListener('click', () => {
      const i = cardsCopy.indexOf(card)
      if (i === -1) {throw new Error('Card not found in cardsCopy')}
      deckCards.push(cardsCopy.splice(i, 1)[0])
      drawDeck()
      if (deckCards.length < 12) {drawShop(nextShopCards)}
      else {shop.replaceChildren()}
    })
    shop.append(el)
  }
  
}

const drawDeck = () => {
  deck.replaceChildren()
  const deckCardsSorted = deckCards.toSorted((a,b) => RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity) || a.name.localeCompare(b.name))
  for (const card of deckCardsSorted) {
    const el = newCard(card)
    deck.append(el)
  }
}

const scanRule = (text: string, rule: Rule): Match[] => {
  const matches: Match[] = []
  for (const term of rule.terms) {
    const pattern = new RegExp(`\\b${term}(es|s)?\\b`, 'g')
    for (const m of text.matchAll(pattern)) {
      matches.push({
        start: m.index,
        end: m.index! + m[0].length,
        text: m[0],
        className: rule.perTerm
          ? `${rule.className} ${rule.className}-${term.toLowerCase()}`
          : rule.className,
      })
    }
  }
  return matches
}

const colorText = (text: string): Piece[] => {
  const pieces: Piece[] = []
  const accepted: Match[] = []
  for (const rule of rules) {
    for (const match of scanRule(text, rule)) {
      // returns true if match overlaps with an existing accepted match
      const taken = accepted.some(m => m.start < match.end && match.start < m.end)
      if (!taken) {
        accepted.push(match)
      }
    }
  }
  accepted.sort((a, b) => a.start - b.start)
  let i = 0
  for (const match of accepted) {
    if (i < match.start) {
      pieces.push({text: text.slice(i, match.start), className: null})
    }
    pieces.push({text: match.text, className: match.className})
    i = match.end
  }
  pieces.push({text: text.slice(i), className: null})
  if (pieces.map(p => p.text).join('') !== text) {
    throw new Error('colorText lost or duplicated text')
  }
  return pieces
}


const drawCardInfo = (card: Card | null) => {
  info.replaceChildren()
  if (!card) return

  const pieces: Piece[] = colorText(card.ability + '\n\n' + card.rarity + ' ' + card.types.join(' '))
  const el = document.createElement('div')
  el.classList.add('cardInfo')
  
  for (const piece of pieces) {
    if (piece.className === null){
      el.append(piece.text)
    }
    else {
      const span = document.createElement('span')
      span.textContent = piece.text
      span.classList.add(...piece.className.split(' '))
      el.append(span)
    }
  }
  info.append(el)
}

// preload images
for (const card of cardsCopy) {
  const img = new Image()
  img.src = card.image
}

// initial shop
drawShop(randShop(shopSize, []))