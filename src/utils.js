/* eslint-disable import/prefer-default-export */

export const getDiff = (oldItems, newItems) => {
  const diffItems = newItems
    .map((item) => item.id)
    .filter((x) => !oldItems.map((item) => item.id).includes(x));

  return newItems.filter((item) => diffItems.includes(item.id));
};
