
const generateShortUrl = () => {
  const mainstring = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortUrl = "";
  for(let i = 0; i < 6; i++) {
    shortUrl += mainstring.charAt(Math.floor(Math.random() * mainstring.length));
  }
  return shortUrl;
};

export default generateShortUrl;
