// @ts-check
/* eslint-disable no-param-reassign */

import { api } from './api';
import watch from './watcher';
import { getDiff } from './utils';

const fetchUsers = async (watchedState) => {
  watchedState.status = 'processing';

  try {
    const users = await api.fetchUsers();

    if (!watchedState.valid) {
      watchedState.valid = true;
      watchedState.error = null;
    }

    watchedState.users = [...watchedState.users, ...users];
    watchedState.status = 'idle';
  } catch (err) {
    watchedState.status = 'failed';
    watchedState.valid = false;
    watchedState.error = err.message;

    console.error(err.message);
  }
};

const fetchPosts = async (watchedState) => {
  try {
    const promises = watchedState.users.length !== 0
      && watchedState.users.map(async (user) => {
        watchedState.status = 'processing';

        const data = await api.fetchPosts(user.id);

        return data;
      });

    const posts = await Promise.all(promises);

    if (posts.length !== 0) {
      watchedState.posts = [
        ...watchedState.posts,
        ...posts.map((items) => items[0]),
      ];

      if (!watchedState.valid) {
        watchedState.valid = true;
        watchedState.error = null;
      }
    }

    watchedState.status = 'idle';
  } catch (err) {
    watchedState.status = 'failed';
    watchedState.valid = false;
    watchedState.error = err.message;

    console.error(err.message);
  }
};

export const fetchComments = async (watchedState, postId = null) => {
  try {
    if (postId) {
      watchedState.status = 'processing';

      const postCommentsIndex = watchedState.comments.findIndex(
        (comments) => comments[0].postId === postId,
      );

      const oldPostComments = watchedState.comments[postCommentsIndex];

      const newPostComments = await api.fetchComments(postId);

      const postCommentsDiff = getDiff(oldPostComments, newPostComments);

      if (postCommentsDiff.length !== 0) {
        if (postCommentsIndex === 0) {
          watchedState.comments = [
            [...postCommentsDiff, ...oldPostComments],
            ...watchedState.comments.slice(postCommentsIndex + 1),
          ];
        } else if (postCommentsIndex === watchedState.comments.length - 1) {
          watchedState.comments = [
            ...watchedState.comments.slice(0, postCommentsIndex),
            [...postCommentsDiff, ...oldPostComments],
          ];
        } else {
          watchedState.comments = [
            ...watchedState.comments.slice(0, postCommentsIndex - 1),
            [...postCommentsDiff, ...oldPostComments],
            ...watchedState.comments.slice(postCommentsIndex + 1),
          ];
        }

        if (!watchedState.valid) {
          watchedState.valid = true;
          watchedState.error = null;
        }
      }

      watchedState.status = 'idle';
    } else {
      const promises = watchedState.posts.length !== 0
        && watchedState.posts.map(async (post) => {
          watchedState.status = 'processing';

          const data = await api.fetchComments(post.id);

          return data;
        });

      const comments = await Promise.all(promises);

      if (comments.length !== 0) {
        watchedState.comments = [...watchedState.comments, ...comments];

        if (!watchedState.valid) {
          watchedState.valid = true;
          watchedState.error = null;
        }
      }
    }

    watchedState.status = 'idle';
  } catch (err) {
    watchedState.status = 'failed';
    watchedState.valid = false;
    watchedState.error = err.message;

    console.error(err.message);
  }
};

const fetchAll = async (watchedState) => {
  await fetchUsers(watchedState);
  await fetchPosts(watchedState);
  await fetchComments(watchedState);
};

const handleTableClick = async (evt, watchedState) => {
  evt.preventDefault();

  if (evt.target.tagName !== 'TD') {
    return;
  }

  const { userId } = evt.target.closest('[data-user-id]').dataset;

  const { id: postId } = watchedState.posts.find(
    (post) => post.userId === Number(userId),
  );

  await fetchComments(watchedState, postId);
};

export default async () => {
  const state = {
    users: [],
    posts: [],
    comments: [],
    status: 'idle',
    valid: true,
    error: null,
  };

  const table = document.querySelector('[data-table="table"]');

  const watchedState = watch(state, table);

  document.addEventListener('DOMContentLoaded', async () => {
    await fetchAll(watchedState);

    table.addEventListener('click', (evt) => handleTableClick(evt, watchedState));
  });
};
