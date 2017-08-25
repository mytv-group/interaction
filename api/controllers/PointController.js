/**
 * PointController
 *
 * @description :: Server-side logic for managing Points
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let http = require('http');
let ipParser = require('ip');

module.exports = {
    /**
     * `PointController.register()`
     */
    register: function (req, res) {
        if (!req.isSocket) {
            return res.badRequest('Only socket connection is allowed');
        }

        let id = parseInt(req.param('id'));

        if (!Number.isInteger(id)) {
            return res.badRequest('ID must be integer');
        }

        sails.sockets.join(req, 'point_' + id);

        return res.json('ok');
    },
    /**
     * `PointController.updateContent()`
     */
    updateContent: function (req, res) {
        let id = parseInt(req.param('id'));
        let ip = ipParser.fromLong(req.param('ip'));

        if (!Number.isInteger(id)) {
            return res.badRequest('ID must be integer');
        }

        if (!ipParser.isV4Format(ip)) {
            return res.badRequest('Incorrect ip format');
        }

        sails.sockets.broadcast('point_' + id, 'updateContent', {});

        try {
            http.request({
                host: ip,
                path: '/sc_upd?update_need=true'
            })
            .on('error', (error) => {
                console.log('Connection to ' + ip + ' failed.', error.message);
            })
            .end();
        } catch (exception) {
            console.log('Connection to ' + ip + ' failed.', exception);
        }

        return res.json('ok');
    }
};
