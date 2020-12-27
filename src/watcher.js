/* eslint-disable no-return-assign */
import onChange from 'on-change';

export default (initialState, element) => {
  const getTableRowActive = (state, tBody) => {
    const { userId } = state.posts.find((post) => post.id === state.meta);

    return Array.from(tBody.rows).find(
      (row) => Number(row.dataset.userId) === userId,
    );
  };

  const handleData = (state, table) => {
    const {
      users, posts, comments, meta,
    } = state;

    const tableBody = table.tBodies[0];

    if (tableBody.childNodes.length !== 0) {
      if (meta) {
        const tableRowActive = getTableRowActive(state, tableBody);

        const tableCellsCount = tableRowActive.cells.length - 1;

        tableRowActive.cells[tableCellsCount].textContent = comments.find(
          (postComments) => postComments[0].postId === meta,
        ).length;
      }
    }

    tableBody.innerHTML = users
      .map(
        (
          user,
          index,
        ) => `<tr style="cursor: pointer;" data-user-id="${user.id}">
              <td class="font-weight-bold">${user.name}</td>
              <td>${posts[index].title}</td>
              <td>${comments[index].length}</td>
            </tr>`,
      )
      .join('\n');
  };

  const handleStatus = (state, table) => {
    const { meta } = state;

    const tableBody = table.tBodies[0];

    const spinnerMarkup = `
      <div class="text-center">
        <div class="spinner-border spinner-border-sm" role="status"></div>
      </div>
      `;

    if (tableBody.childNodes.length !== 0) {
      const tableCellsCount = tableBody.rows[0].cells.length - 1;

      const tableCells = Array.from(tableBody.rows).map(
        (row) => row.cells[tableCellsCount],
      );

      switch (state.status) {
        case 'processing':
          if (meta) {
            const tableRowActive = getTableRowActive(state, tableBody);

            tableRowActive.cells[tableCellsCount].innerHTML = spinnerMarkup;
          } else {
            tableCells.forEach((cell) => {
              const tableCell = cell;

              tableCell.innerHTML = spinnerMarkup;
            });
          }

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
