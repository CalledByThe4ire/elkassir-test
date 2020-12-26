// @ts-check
/* eslint-disable no-param-reassign */

import { api } from './api';
import watch from './watcher';
import { getDiff } from './utils';

export default async () => {
  const state = {
    users: [],
    posts: [],
    comments: [],
    state: 'idle', // idle, processing, failed
    valid: true,
    error: null,
  };

  const fetchUsers = async (watchedState) => {
    watchedState.state = 'processing';

    try {
      const users = await api.fetchUsers();

      if (!watchedState.valid) {
        watchedState.valid = true;
        watchedState.error = null;
      }

      watchedState.users = [...state.users, ...users];
      watchedState.state = 'idle';
    } catch (err) {
      watchedState.state = 'failed';
      watchedState.valid = false;
      watchedState.error = err.message;

      console.error(err.message);
    }
  };

  const fetchPosts = async (watchedState) => {
    try {
      const promises = watchedState.users.length !== 0
        && watchedState.users.map(async (user) => {
          watchedState.state = 'processing';

          const data = await api.fetchPosts(user.id);

          return data;
        });

      const posts = await Promise.all(promises);

      if (posts.length !== 0) {
        watchedState.posts = [
          ...watchedState.posts,
          ...posts.map((post) => post.find((p) => p)),
        ];

        if (!watchedState.valid) {
          watchedState.valid = true;
          watchedState.error = null;
        }
      }

      watchedState.state = 'idle';
    } catch (err) {
      watchedState.state = 'failed';
      watchedState.valid = false;
      watchedState.error = err.message;

      console.error(err.message);
    }
  };

  const fetchComments = async (watchedState, postId = null) => {
    try {
      if (postId) {
        watchedState.state = 'processing';

        const postCommentsIndex = watchedState.comments.findIndex(
          (comments) => comments[0].postId === postId,
        );

        const oldPostComments = watchedState.comments[postCommentsIndex];

        const newPostComments = await api.fetchComments(postId);

        const postCommentsDiff = getDiff(oldPostComments, newPostComments);

        if (postCommentsDiff.length !== 0) {
          watchedState.comments[postCommentsIndex] = [
            ...postCommentsDiff,
            ...watchedState.comments[postCommentsIndex],
          ];

          if (!watchedState.valid) {
            watchedState.valid = true;
            watchedState.error = null;
          }
        }

        watchedState.state = 'idle';
      } else {
        const promises = watchedState.posts.length !== 0
          && watchedState.posts.map(async (post) => {
            watchedState.state = 'processing';

            const data = await api.fetchComments(post.userId);

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

      watchedState.state = 'idle';
    } catch (err) {
      watchedState.state = 'failed';
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

  const table = document.querySelector('[data-table="table"]');

  const watchedState = watch(state, table);

  document.addEventListener('DOMContentLoaded', async () => {
    await fetchAll(watchedState);

    console.log(state);
  });

  table.addEventListener('click', (evt) => {
    evt.preventDefault();
  });
};
