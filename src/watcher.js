/* eslint-disable no-param-reassign */
import onChange from 'on-change';

export default (initialState, element) => {
  const watchedState = onChange(initialState, (path) => {
    const { users, posts, comments } = initialState;

    switch (path) {
      case 'comments':
        /* eslint-disable-next-line */
        const tableBody = [...new Array(users.length)]
          .map(
            (item, index) => `<tr style="cursor: pointer;"><td><span class="font-weight-bold">${users[index].name}</span></td><td>${posts[index].title}</td><td>${comments[index].length}</td></tr>`,
          )
          .join('\n');

        element.querySelector('tbody').innerHTML = tableBody;

        break;
      default:
        break;
    }
  });

  return watchedState;
};
