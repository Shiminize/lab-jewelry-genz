module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [{
        name: '@/server/db/mongo',
        message: 'Server-only module; do not import from client components.'
      }]
    }]
  }
};
