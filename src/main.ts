import './style.css'
import cards from './cards.json'

const shop = document.querySelector('#shop')
if (shop) {
  const cardsCopy = [...cards]
  const shopCards = []
  const shopSize = 3
  for(let x = 0; x < shopSize; x++){
    if (cardsCopy.length == 0) {break}
    const i = Math.floor(Math.random() * cardsCopy.length)
    shopCards.push(cardsCopy.splice(i, 1)[0])
  }

  for(const card of shopCards){
    const el = document.createElement('div')
    el.textContent = card.name
    shop.append(el)
  }
}