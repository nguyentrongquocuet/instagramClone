export const inputEffect = (className) => {
  try {
    const formField = document.getElementsByClassName(className);
    for (let i = 0; i < formField.length - 1; i++) {
      if ((formField[i].childNodes[0] as HTMLInputElement).value.length > 0) {
        (formField[i].childNodes[0] as HTMLElement).classList.add('inputFocus');
        (formField[i].childNodes[1] as HTMLElement).classList.add('effect');
      } else {
        (formField[i].childNodes[0] as HTMLElement).classList.remove(
          'inputFocus'
        );
        (formField[i].childNodes[1] as HTMLElement).classList.remove('effect');
      }
    }
  } catch (error) {}
};

function check(e: HTMLElement) {}
