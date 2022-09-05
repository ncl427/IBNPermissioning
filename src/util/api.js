import external from 'request';

const objAuth = {
  username: 'admin',
  password: 'admin'
};

const baseUrl = 'https://localhost:1280/edge/management/v1';

var user = '';
var authorization = 0;

export const deleteZitiIdentity = async value => {
  Authenticate(objAuth).then(results => {
    //response.json(results);
    DoCall(baseUrl + '/identities?filter=(name="' + value + '")&limit=1', {}, user, true).then(results => {
      if (results.data != null && results.data.length > 0) {
        console.log(results.data[0]);
        console.log('LA IDENTIDAD', results.data[0].id);
        DoDelete(results.data[0].id, user).then(results => {
          console.log('DELETE', results.data[0].id);
        });
      } else console.log(null);
    });
  });
};

/**
 * Authentication method, authenticates the user to the provided edge controller defined by url
 */

function Authenticate(obj) {
  return new Promise(function (resolve, reject) {
    console.log('Connecting to: ' + baseUrl + '/authenticate?method=password');
    if (objAuth != null) {
      external.post(
        baseUrl + '/authenticate?method=password',
        { json: obj, rejectUnauthorized: false },
        function (err, res, body) {
          if (err) {
            console.log(err);
            var error = 'Server Not Accessible';
            if (err.code != 'ECONNREFUSED') resolve({ error: err.code });
            resolve({ error: error });
          } else {
            if (body.error) resolve({ error: body.error.message });
            else {
              if (body.data && body.data.token) {
                user = body.data.token;
                authorization = 100;
                resolve({ success: 'Logged In' });
              } else resolve({ error: 'Invalid Account' });
            }
          }
        }
      );
    }
  });
}

function DoCall(url, json, user, isFirst = true) {
  return new Promise(function (resolve, reject) {
    console.log('Calling: ' + url + ' ' + isFirst + ' ' + user);
    external.get(
      url,
      { json: json, rejectUnauthorized: false, headers: { 'zt-session': user } },
      function (err, res, body) {
        if (err) {
          console.log('Server Error: ' + JSON.stringify(err));
          resolve({ error: err });
        } else if (body.data) {
          console.log('Items: ' + body.data.length);
          resolve(body);
        } else {
          console.log('No Items');
          body.data = [];
          resolve(body);
        }
      }
    );
  });
}

function DoDelete(ids, user) {
  return new Promise(function (resolve, reject) {
    if (ids == '') resolve(true);
    else {
      var id = ids;
      ProcessDelete(id, user)
        .then(result => {
          console.log('SUCCESS');
        })
        .catch(error => {
          console.log('Reject: ' + JSON.stringify(error));
          reject(error);
        });
    }
  });
}

/**
 * Create the promise required to delete a specific object from the edge controller
 *
 * @param {The type of object being deleted} type
 * @param {The id of the object to delete} id
 * @param {The specified user token deleting the object} user
 */
function ProcessDelete(id, user) {
  return new Promise(function (resolve, reject) {
    console.log('DELETE: ' + baseUrl + '/identities/' + id);
    external.delete(
      baseUrl + '/identities/' + id,
      { json: {}, rejectUnauthorized: false, headers: { 'zt-session': user } },
      function (err, res, body) {
        if (err) {
          console.log('Err: ' + err);
          reject(err);
        } else {
          if (body) {
            console.log(JSON.stringify(body));
            resolve(body.data);
          } else {
            console.log('Reject: No Controller');
            reject({ message: 'Controller Unavailable' });
          }
        }
      }
    );
  });
}
