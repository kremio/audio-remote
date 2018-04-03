const ALPHABET = "aäzeéèrtyuùiopqsdfghjklmwxcvbn"

function integer(min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER){
  if( max < min ){
    throw new Error("Integer generator: Max bound lower than min bound")
  }
  return Math.round( min + Math.random()*(max - min) )
}

function natural(min = 0, max = Number.MAX_SAFE_INTEGER){
  return integer( Math.max(0, min), max)
}

function duration(){
   return Number( `${natural(0,120)}.${natural(0,99)}` )
}

function date(){
  return `${(""+natural(1700, 3000)).padStart(4,'0')}-${(""+natural(1, 12)).padStart(2,'0')}-${(""+natural(1, 31)).padStart(2,'0')}`
}

function name(maxLength = 7){
  const minLength = 3
  maxLength = Math.max(minLength, maxLength)
  return [...Array(maxLength-1)].reduce( (acc) => {
    return acc + ALPHABET[Math.floor(Math.random()*ALPHABET.length)]
  }, ALPHABET[Math.floor(Math.random()*ALPHABET.length)].toUpperCase()
  )
}

const DISCID_CHARS = "azertyuiopqsdfghjklmwxcvbnAZERTYUIOPQSDFGHJKLMWXCVBN1234567890._-"

function discid(){
  return [...Array(28)]
    .reduce( (acc) => acc + DISCID_CHARS[Math.floor(Math.random()*DISCID_CHARS.length)] , "")
}

const MBID_CHARS = "0123456789-abcdef"

function mbid(){
  return [...Array(36)]
  .reduce( (acc) => acc + MBID_CHARS[Math.floor(Math.random()*MBID_CHARS.length)] , "")

}
/*
function objectToColumnsValues(obj){
  return {
    columns: Object.keys(obj),
    values: Object.values(obj)
  }
}
*/

module.exports = {
  integer,
  natural,
  duration,
  date,
  name,
  discid,
  mbid,
  //objectToColumnsValues
}
