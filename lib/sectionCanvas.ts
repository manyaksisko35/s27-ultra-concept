// Ortak 3D tuvalin (SectionCanvas) talep üzerine çizim tetikleyicisi.
// DOM tarafı (scroll) ve 3D tarafı (hedefe varmamış animasyon) yeni kare istemek için bunu çağırır.
let request: () => void = () => {};

export const setRequestFrame = (fn: () => void) => {
  request = fn;
};
export const requestFrame = () => request();
