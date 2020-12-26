/* eslint-disable no-return-assign */
import onChange from 'on-change';

export default (initialState, element) => {
  const handleData = (state, table) => {
    const tableElement = table;

    const { users, posts, comments } = state;

    tableElement.querySelector('tbody').innerHTML = users
      .map(
        (user, index) => (
          `<tr style="cursor: pointer;" data-user-id="${user.id}">
              <td class="font-weight-bold">${user.name}</td>
              <td>${posts[index].title}</td>
              <td>${comments[index].length}</td>
            </tr>`
        ),
      )
      .join('\n');
  };

  const handleStatus = (state, table) => {
    const tableBody = table.tBodies[0];

    if (tableBody.childNodes.length !== 0) {
      const tableCells = Array.from(tableBody.rows).map(
        (row) => row.cells[row.cells.length - 1],
      );

      switch (state.status) {
        case 'processing':
          tableCells.slice().forEach(
            (cell) => {
              const tableCell = cell;

              return tableCell.innerHTML = (
                `<div class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                  </div>`
              );
            },
          );
          break;

        case 'idle':
          handleData(state, table);
          break;

        default:
          break;
      }
    }
  };

  const watchedState = onChange(initialState, (path) => {
    switch (path) {
      case 'status':
        handleStatus(initialState, element);
        break;

      case 'comments':
        handleData(initialState, element);
        break;

      default:
        break;
    }
  });

  return watchedState;
};
