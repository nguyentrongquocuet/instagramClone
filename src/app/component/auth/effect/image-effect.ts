export const imageShow = (className) => {
  let imageIndex = 1;
  try {
    const imagesElement = document.getElementsByClassName(className)[0]
      .children;
    let previousElement = imagesElement[0];
    setInterval(() => {
      previousElement.classList.remove('show');
      const cur = imagesElement[imageIndex];
      imagesElement[imageIndex].classList.add('show');
      previousElement = cur as HTMLElement;
      imageIndex = (imageIndex + 1) % imagesElement.length;
    }, 3000);
  } catch (err) {}
};
