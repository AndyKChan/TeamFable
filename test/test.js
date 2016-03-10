var express = require('express');
var router = express.Router();
var should = require('should'); 
var supertest = require("supertest");
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var server = supertest.agent("http://localhost:3000");

describe('Routing', function() {

  it("should return the index page",function(done){
    server
    .get("/")
    .expect(200) // THis is HTTP response
    .end(function(err, res){
       if (err) throw err;
           res.status.should.equal(200);
       });

    done();
    });

    it('should return error trying to make account with duplicate username', function(done) {
      var user = {
        local: {
        username: 'stuff',
        password: 'noob',
        email: 'stuff@stuff.ca'
      }
      };

    server
	.post('/signup')
	.send(user)
	.end(function(err, res) {
          if (err) {
            throw err;
          }
          done();
        });
    });

    it('should upload a file', function(done) {

    server
  .post('/signup')
  .send(file)
  .end(function(err, res) {
          if (err) {
            throw err;
          }
          done();
        });
    });

   it('should post a comment', function(done){
	 var comment = {
        post: "first post",
        commentor: "alex",
        picture: "nothing atm",
        date: "monday",
    };
	server
		.post('/comment')
		.send(comment)
		.end(function(err,res) {
			if (err) {
				throw err;
			}
          res.body.post.should.equal('alex');
			done();
		});
	});
});
