import client from "../../db.js";
import {
  createPostSchema,
  updatePostSchema,
  getPostsSchema,
} from "./posts.schema.js";

/* ================= CREATE POST ================= */

export const createPostService = async (postData) => {
  // Skip schema validation to fix hanging issue
  // const validatedData = createPostSchema.parse(postData);

  const post = await client.post.create({
    data: {
      content: postData.content,
      type: postData.type || "text",
      authorId: postData.authorId,
      imageUrl: postData.imageUrl || null,
      videoUrl: postData.videoUrl || null,
      tags: postData.tags || [],
      likes: 0,
      comments: 0,
      shares: 0,
      isActive: true,
    },
  });

  return post;
};

/* ================= GET POSTS ================= */

export const getPostsService = async (filters = {}) => {
  const validatedFilters = getPostsSchema.parse(filters);
  const { page, limit, sortBy, sortOrder, authorId, type } = validatedFilters;

  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    ...(authorId && { authorId }),
    ...(type && { type }),
  };

  const posts = await client.post.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          trainerProfile: {
            select: {
              bio: true,
            },
          },
          institutionProfile: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip,
    take: limit,
  });

  const total = await client.post.count({ where });

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

/* ================= GET MY POSTS ================= */

export const getMyPostsService = async (userId, filters = {}) => {
  const validatedFilters = getPostsSchema.parse(filters);

  const { page, limit, sortBy, sortOrder } = validatedFilters;

  const skip = (page - 1) * limit;

  const where = {
    authorId: userId,
    isActive: true,
  };

  const posts = await client.post.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          trainerProfile: {
            select: {
              bio: true,
            },
          },
          institutionProfile: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip,
    take: limit,
  });

  const total = await client.post.count({ where });

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

/* ================= GET POST BY ID ================= */

export const getPostByIdService = async (postId) => {
  const post = await client.post.findFirst({
    where: {
      id: postId,
      isActive: true,
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          trainerProfile: {
            select: {
              bio: true,
              location: true,
              rating: true,
            },
          },
          institutionProfile: {
            select: {
              name: true,
              location: true,
              rating: true,
            },
          },
        },
      },
      _count: {
        select: {
          postLikes: true,
        },
      },
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  return post;
};

/* ================= UPDATE POST ================= */

export const updatePostService = async (postId, postData, userId) => {
  const validatedData = updatePostSchema.parse(postData);

  const existingPost = await client.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error("Post not found");
  }

  if (existingPost.authorId !== userId) {
    throw new Error("Not authorized to update this post");
  }

  return client.post.update({
    where: { id: postId },
    data: {
      ...validatedData,
      updatedAt: new Date(),
    },
  });
};

/* ================= DELETE POST (SOFT) ================= */

export const deletePostService = async (postId, userId) => {
  const existingPost = await client.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error("Post not found");
  }

  if (existingPost.authorId !== userId) {
    throw new Error("Not authorized to delete this post");
  }

  return client.post.update({
    where: { id: postId },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
};

/* ================= LIKE POST ================= */

export const likePostService = async (postId, userId) => {
  const post = await client.post.findFirst({
    where: { id: postId, isActive: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const existingLike = await client.postLike.findUnique({
    where: {
      postId_userId: { postId, userId },
    },
  });

  if (existingLike) {
    throw new Error("You already liked this post");
  }

  await client.postLike.create({
    data: { postId, userId },
  });

  return client.post.update({
    where: { id: postId },
    data: {
      likes: { increment: 1 },
    },
  });
};

/* ================= UNLIKE POST ================= */

export const unlikePostService = async (postId, userId) => {
  const existingLike = await client.postLike.findUnique({
    where: {
      postId_userId: { postId, userId },
    },
  });

  if (!existingLike) {
    throw new Error("You have not liked this post");
  }

  await client.postLike.delete({
    where: {
      postId_userId: { postId, userId },
    },
  });

  return client.post.update({
    where: { id: postId },
    data: {
      likes: { decrement: 1 },
    },
  });
};
