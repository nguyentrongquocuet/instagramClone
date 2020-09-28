import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

export const mimeType = (
  c: FormControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (!c.value) {
    return new Observable((observer) => {
      observer.next(null);
      observer.complete();
    });
  }
  const fr = new FileReader();
  const file = c.value as File;
  let header = '';
  return new Observable((observe) => {
    fr.addEventListener('loadend', () => {
      const arr = new Uint8Array(fr.result as ArrayBuffer).subarray(0, 4);
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      let isValid = false;
      switch (header) {
        case '89504e47':
          isValid = true;
          break;
        case 'ffd8ffe0':
        case 'ffd8ffe2':
        case 'ffd8ffe1':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;
        default:
          isValid = false;
          break;
      }
      console.log(header, isValid);
      if (isValid) {
        observe.next(null);
        observe.complete();
      } else {
        observe.next({ 'invalid-mimetype': true });
        observe.complete();
      }
    });
    fr.readAsArrayBuffer(file);
  });
};
