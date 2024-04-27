const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require('unique-names-generator')

export const createRandomEmail = () => {
  const randomEmail = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '',
    style: 'lowerCase',
  })

  return randomEmail
}
