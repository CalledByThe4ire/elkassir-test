/* eslint-disable import/prefer-default-export */

export const getDiff = (oldItems, newItems) => {
  const diffItems = oldItems
    .map((item) => item.id)
    .filter((x) => !newItems.map((item) => item.id).includes(x));

  return newItems.filter((item) => diffItems.includes(item.id));
};
