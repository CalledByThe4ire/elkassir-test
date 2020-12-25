/* eslint-disable import/prefer-default-export */
import { ROOT_URL as ROOT_URI } from './config';

const getResource = async (segment) => {
  const res = await fetch(`${ROOT_URI}${segment}`);

  if (!res.ok) {
    throw new Error(`Could not fetch ${segment}, received ${res.status}`);
  }

  const data = await res.json();

  return data;
};

export const api = {
  async fetchUsers() {
    const res = await getResource('/users/');

    return res;
  },
  async fetchComments(userId) {
    const res = await getResource(`/comments?postId=${userId}`);

    return res;
  },
  async fetchPosts(userId) {
    const res = await getResource(`/posts?userId=${userId}`);

    return res;
  },
};
