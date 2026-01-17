// export function successResponse(data, message = 'Success', statusCode = 200) {
//   return Response.json(
//     {
//       success: true,
//       message,
//       data,
//     },
//     { status: statusCode }
//   );
// }

// export function errorResponse(message, statusCode = 400, errors = null) {
//   const response = {
//     success: false,
//     message,
//   };

//   if (errors) {
//     response.errors = errors;
//   }

//   return Response.json(response, { status: statusCode });
// }
