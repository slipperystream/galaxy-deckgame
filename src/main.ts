import './style.css'
import cards from './cards.json'
type Card = (typeof cards)[number]
const cardsCopy = [...cards]
const deckCards: Card[] = []

const shop = document.querySelector('#shop')
const deck = document.querySelector('#deck')
if (!shop || !deck) {throw new Error('Something is missing')}
  
const shopSize = 3

// generate list of shop cards
const randShop = (shopSize: number) => {
  const cardsCopy2 = [...cardsCopy]
  const shopCards = []
  for(let x = 0; x < shopSize; x++){
    if (cardsCopy2.length === 0) {break}
    const i = Math.floor(Math.random() * cardsCopy2.length)
    shopCards.push(cardsCopy2.splice(i, 1)[0])
  }
  return shopCards
}

const drawShop = (shopCards: Card[]) => {
  shop.replaceChildren()
  for(const card of shopCards){
    const el = document.createElement('button')
    el.classList.add('card')
    const img = document.createElement('img')
    img.src = card.image
    img.alt = card.name
    el.append(img)
    el.addEventListener('click', () => {
      deckCards.push(cardsCopy.splice(cardsCopy.indexOf(card), 1)[0])
      drawDeck()
      if (deckCards.length < 12) {drawShop(randShop(shopSize))}
      else {shop.replaceChildren()}
    })
    shop.append(el)
  }
}

const drawDeck = () => {
  deck.replaceChildren()
  const deckCardsSorted = deckCards.toSorted((a,b) => a.name.localeCompare(b.name))
  for (const card of deckCardsSorted) {
    const el = document.createElement('button')
    el.classList.add('card')
    const img = document.createElement('img')
    img.src = card.image
    img.alt = card.name
    el.append(img)
    deck.append(el)
  }
}

drawShop(randShop(shopSize))