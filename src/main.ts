import './style.css'
import cards from './cards.json'
type Card = (typeof cards)[number]

const shop = document.querySelector('#shop')
const deck = document.querySelector('#deck')

if (shop && deck) {
  const cardsCopy = [...cards]
  const deckCards: Card[] = []

  // generate list of shop cards
  const shopCards = []
  const shopSize = 3
  for(let x = 0; x < shopSize; x++){
    if (cardsCopy.length == 0) {break}
    const i = Math.floor(Math.random() * cardsCopy.length)
    shopCards.push(cardsCopy.splice(i, 1)[0])
  }

  const drawDeck = () => {
    deck.replaceChildren()
    const deckCardsSorted: Card[] = deckCards.toSorted((a,b) => a.name.localeCompare(b.name))
    for (const card of deckCardsSorted) {
      const el = document.createElement('div')
      el.textContent = card.name
      deck.append(el)
    }
  }

  // create each shop card <div>
  for(const card of shopCards){
    const el = document.createElement('div')
    el.textContent = card.name
    el.addEventListener('click', () => {
      deckCards.push(card)
      drawDeck()
    })
    shop.append(el)
  }

  

}