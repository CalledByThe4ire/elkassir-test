import onChange from 'on-change';

export default (initialState) => {
  const watchedState = onChange(initialState, (path) => {
    switch (path) {
      default: {
        break;
      }
    }
  });

  return watchedState;
};
