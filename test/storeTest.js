var expect = require('expect.js'),
  Base = require('../lib/base'),
  async = require('async'),
  _ = require('lodash');

var types = ['inmemory'/*, 'mongodb', 'tingodb', 'redis', 'couchdb'*/];

types.forEach(function (type) {

  describe('"' + type + '" store implementation', function () {

    var Store = require('../lib/database/' + type);
    var store;

    describe('creating an instance', function () {
      
      it('it should return correct object', function () {

        store = new Store();
        expect(store).to.be.a(Base);
        expect(store.connect).to.be.a('function');
        expect(store.disconnect).to.be.a('function');
        expect(store.getNewId).to.be.a('function');
        expect(store.getEvents).to.be.a('function');
        expect(store.getEventsByRevision).to.be.a('function');
        expect(store.getSnapshot).to.be.a('function');
        expect(store.addSnapshot).to.be.a('function');
        expect(store.addEvents).to.be.a('function');
        expect(store.getUndispatchedEvents).to.be.a('function');
        expect(store.setEventToDispatched).to.be.a('function');
        expect(store.clear).to.be.a('function');
      });
      
      describe('calling connect', function () {
        
        afterEach(function (done) {
          store.disconnect(done);
        });
        
        it('it should callback successfully', function (done) {

          store.connect(function (err) {
            expect(err).not.to.be.ok();
            done();
          });

        });

        it('it should emit connect', function (done) {

          store.once('connect', done);
          store.connect();

        });
        
      });

      describe('having connected', function () {

        describe('calling disconnect', function () {

          beforeEach(function (done) {
            store.connect(done);
          });

          it('it should callback successfully', function (done) {

            store.disconnect(function (err) {
              expect(err).not.to.be.ok();
              done();
            });

          });

          it('it should emit disconnect', function (done) {

            store.once('disconnect', done);
            store.disconnect();

          });

        });

        describe('using the store', function () {

          before(function (done) {
            store.connect(done);
          });
          
          beforeEach(function (done) {
            store.clear(done);
          });
  
          describe('calling getNewId', function () {
  
            it('it should callback with a new Id as string', function (done) {
  
              store.getNewId(function (err, id) {
                expect(err).not.to.be.ok();
                expect(id).to.be.a('string');
                done();
              });
  
            });
  
          });
  
          describe('calling addEvents', function () {
            
            describe('with one event in the array', function () {

              it('it should save the event', function(done) {

                var event = {
                  aggregateId: 'id1',
                  streamRevision: 0,
                  commitId: '111',
                  commitStamp: new Date(),
                  payload: {
                    event:'bla'
                  }
                };

                store.addEvents([event], function(err) {
                  expect(err).not.to.be.ok();

                  store.getEvents({}, 0, -1, function(err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts).to.be.an('array');
                    expect(evts).to.have.length(1);
                    expect(evts[0].commitStamp.getTime()).to.eql(event.commitStamp.getTime());
                    expect(evts[0].aggregateId).to.eql(event.aggregateId);
                    expect(evts[0].commitId).to.eql(event.commitId);
                    expect(evts[0].payload.event).to.eql(event.payload.event);

                    done();
                  });
                });

              });
              
            });

            describe('with multiple events in the array', function () {

              it('it should save the event', function(done) {

                var event1 = {
                  aggregateId: 'id2',
                  streamRevision: 0,
                  commitId: '112',
                  commitStamp: new Date(),
                  payload: {
                    event:'bla'
                  }
                };

                var event2 = {
                  aggregateId: 'id2',
                  streamRevision: 0,
                  commitId: '113',
                  commitStamp: new Date(),
                  payload: {
                    event:'bla2'
                  }
                };

                store.addEvents([event1, event2], function(err) {
                  expect(err).not.to.be.ok();

                  store.getEvents({}, 0, -1, function(err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts).to.be.an('array');
                    expect(evts).to.have.length(2);
                    expect(evts[0].commitStamp.getTime()).to.eql(event1.commitStamp.getTime());
                    expect(evts[0].aggregateId).to.eql(event1.aggregateId);
                    expect(evts[0].commitId).to.eql(event1.commitId);
                    expect(evts[0].payload.event).to.eql(event1.payload.event);
                    expect(evts[1].commitStamp.getTime()).to.eql(event2.commitStamp.getTime());
                    expect(evts[1].aggregateId).to.eql(event2.aggregateId);
                    expect(evts[1].commitId).to.eql(event2.commitId);
                    expect(evts[1].payload.event).to.eql(event2.payload.event);

                    done();
                  });
                });

              });

            });
            
            describe('without aggregateId', function () {
              
              it('it should callback with an error', function (done) {

                var event = {
                  //aggregateId: 'id1',
                  streamRevision: 0,
                  commitId: '114',
                  commitStamp: new Date(),
                  payload: {
                    event:'bla'
                  }
                };

                store.addEvents([event], function(err) {
                  expect(err).to.be.ok();
                  done();
                });
                
              });
              
            });

            describe('only with aggregateId', function () {

              it('it should save the event', function (done) {

                var event = {
                  aggregateId: 'idhaha',
                  streamRevision: 0,
                  commitId: '115',
                  commitStamp: new Date(),
                  payload: {
                    event:'blaffff'
                  }
                };

                store.addEvents([event], function(err) {
                  expect(err).not.to.be.ok();
                  
                  store.getEvents({}, 0, -1, function(err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts).to.be.an('array');
                    expect(evts).to.have.length(1);
                    expect(evts[0].commitStamp.getTime()).to.eql(event.commitStamp.getTime());
                    expect(evts[0].aggregateId).to.eql(event.aggregateId);
                    expect(evts[0].commitId).to.eql(event.commitId);
                    expect(evts[0].payload.event).to.eql(event.payload.event);

                    done();
                  });
                });

              });

            });

            describe('with aggregateId and aggregate', function () {

              it('it should save the event correctly', function (done) {

                var event = {
                  aggregateId: 'aggId',
                  aggregate: 'myAgg',
                  streamRevision: 0,
                  commitId: '116',
                  commitStamp: new Date(),
                  payload: {
                    event:'blaffff'
                  }
                };

                store.addEvents([event], function(err) {
                  expect(err).not.to.be.ok();

                  store.getEvents({}, 0, -1, function(err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts).to.be.an('array');
                    expect(evts).to.have.length(1);
                    expect(evts[0].commitStamp.getTime()).to.eql(event.commitStamp.getTime());
                    expect(evts[0].aggregateId).to.eql(event.aggregateId);
                    expect(evts[0].aggregate).to.eql(event.aggregate);
                    expect(evts[0].commitId).to.eql(event.commitId);
                    expect(evts[0].payload.event).to.eql(event.payload.event);

                    done();
                  });
                });

              });

            });

            describe('with aggregateId and aggregate and context', function () {

              it('it should save the event correctly', function (done) {

                var event = {
                  aggregateId: 'aggId',
                  aggregate: 'myAgg',
                  context: 'myContext',
                  streamRevision: 0,
                  commitId: '117',
                  commitStamp: new Date(),
                  payload: {
                    event:'blaffff'
                  }
                };

                store.addEvents([event], function(err) {
                  expect(err).not.to.be.ok();

                  store.getEvents({}, 0, -1, function(err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts).to.be.an('array');
                    expect(evts).to.have.length(1);
                    expect(evts[0].commitStamp.getTime()).to.eql(event.commitStamp.getTime());
                    expect(evts[0].aggregateId).to.eql(event.aggregateId);
                    expect(evts[0].aggregate).to.eql(event.aggregate);
                    expect(evts[0].context).to.eql(event.context);
                    expect(evts[0].commitId).to.eql(event.commitId);
                    expect(evts[0].payload.event).to.eql(event.payload.event);

                    done();
                  });
                });

              });

            });

            describe('with aggregateId and context', function () {

              it('it should save the event correctly', function (done) {

                var event = {
                  aggregateId: 'aggId',
                  context: 'myContext',
                  streamRevision: 0,
                  commitStamp: new Date(),
                  commitId: '118',
                  payload: {
                    event:'blaffff'
                  }
                };

                store.addEvents([event], function(err) {
                  expect(err).not.to.be.ok();

                  store.getEvents({}, 0, -1, function(err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts).to.be.an('array');
                    expect(evts).to.have.length(1);
                    expect(evts[0].commitStamp.getTime()).to.eql(event.commitStamp.getTime());
                    expect(evts[0].aggregateId).to.eql(event.aggregateId);
                    expect(evts[0].context).to.eql(event.context);
                    expect(evts[0].commitId).to.eql(event.commitId);
                    expect(evts[0].payload.event).to.eql(event.payload.event);

                    done();
                  });
                });

              });

            });
            
          });
          
          describe('having some events in the eventstore', function () {
            
            var stream1 = [{
              aggregateId: 'id',
              streamRevision: 0,
              commitId: '119',
              commitStamp: new Date(Date.now() + 10),
              payload: {
                event:'bla'
              }
            }, {
              aggregateId: 'id',
              streamRevision: 1,
              commitId: '120',
              commitStamp: new Date(Date.now() + 20),
              payload: {
                event:'bla2'
              }
            }];

            var stream2 = [{
              aggregateId: 'idWithAgg',
              aggregate: 'myAgg',
              streamRevision: 0,
              commitId: '121',
              commitStamp: new Date(Date.now() + 30),
              payload: {
                event:'bla'
              }
            }, {
              aggregateId: 'idWithAgg',
              aggregate: 'myAgg',
              streamRevision: 1,
              commitId: '122',
              commitStamp: new Date(Date.now() + 40),
              payload: {
                event: 'bla2'
              }
            }];
            
            var stream3 = [{
              aggregateId: 'id', // id already existing...
              aggregate: 'myAgg',
              streamRevision: 0,
              commitId: '123',
              commitStamp: new Date(Date.now() + 50),
              payload: {
                event:'bla2'
              }
            }];

            var stream4 = [{
              aggregateId: 'idWithCont',
              context: 'myCont',
              streamRevision: 0,
              commitId: '124',
              commitStamp: new Date(Date.now() + 60),
              payload: {
                event:'bla'
              }
            }, {
              aggregateId: 'idWithCont',
              context: 'myCont',
              streamRevision: 1,
              commitId: '125',
              commitStamp: new Date(Date.now() + 70),
              payload: {
                event: 'bla2'
              }
            }];

            var stream5 = [{
              aggregateId: 'id', // id already existing...
              context: 'myCont',
              streamRevision: 0,
              commitId: '126',
              commitStamp: new Date(Date.now() + 80),
              payload: {
                event:'bla2'
              }
            }];

            var stream6 = [{
              aggregateId: 'idWithAggrAndCont',
              aggregate: 'myAggrrr',
              context: 'myConttttt',
              streamRevision: 0,
              commitId: '127',
              commitStamp: new Date(Date.now() + 90),
              payload: {
                event:'bla'
              }
            }, {
              aggregateId: 'idWithAggrAndCont',
              aggregate: 'myAggrrr',
              context: 'myConttttt',
              streamRevision: 1,
              commitId: '128',
              commitStamp: new Date(Date.now() + 100),
              payload: {
                event: 'bla2'
              }
            }];

            var stream7 = [{
              aggregateId: 'idWithAggrAndCont2',
              aggregate: 'myAggrrr2',
              context: 'myConttttt',
              streamRevision: 0,
              commitId: '129',
              commitStamp: new Date(Date.now() + 110),
              payload: {
                event:'bla'
              }
            }, {
              aggregateId: 'idWithAggrAndCont2',
              aggregate: 'myAggrrr2',
              context: 'myConttttt',
              streamRevision: 1,
              commitId: '130',
              commitStamp: new Date(Date.now() + 120),
              payload: {
                event: 'bla2'
              }
            }];

            var stream8 = [{
              aggregateId: 'idWithAggrAndCont2',
              aggregate: 'myAggrrr',
              context: 'myConttttt',
              streamRevision: 0,
              commitId: '131',
              commitStamp: new Date(Date.now() + 130),
              payload: {
                event:'bla'
              }
            }];

            var stream9 = [{
              aggregateId: 'idWithAggrAndCont',
              aggregate: 'myAggrrr2',
              context: 'myConttttt',
              streamRevision: 0,
              commitId: '132',
              commitStamp: new Date(Date.now() + 140),
              payload: {
                event: 'bla2'
              }
            }];

            var stream10 = [{
              aggregateId: 'id', // id already existing...
              aggregate: 'wowAgg',
              context: 'wowCont',
              streamRevision: 0,
              commitId: '126',
              commitStamp: new Date(Date.now() + 150),
              payload: {
                event:'bla2'
              }
            }];
            
            var allEvents = [].concat(stream1).concat(stream2).concat(stream3)
                              .concat(stream4).concat(stream5).concat(stream6)
                              .concat(stream7).concat(stream8).concat(stream9).concat(stream10);
            
            beforeEach(function (done) {
              async.series([
                function (callback) {
                  store.addEvents(stream1, callback);
                },
                function (callback) {
                  store.addEvents(stream2, callback);
                },
                function (callback) {
                  store.addEvents(stream3, callback);
                },
                function (callback) {
                  store.addEvents(stream4, callback);
                },
                function (callback) {
                  store.addEvents(stream5, callback);
                },
                function (callback) {
                  store.addEvents(stream6, callback);
                },
                function (callback) {
                  store.addEvents(stream7, callback);
                },
                function (callback) {
                  store.addEvents(stream8, callback);
                },
                function (callback) {
                  store.addEvents(stream9, callback);
                },
                function (callback) {
                  store.addEvents(stream10, callback);
                }
              ], done);
            });
            
            describe('calling getEvents', function () {
              
              describe('to get all events', function () {
                
                it('it should return the correct values', function (done) {
                  
                  store.getEvents({}, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(allEvents.length);
                    
                    var lastCommitStamp = 0;
                    _.each(evts, function (evt) {
                      expect(evt.commitStamp.getTime()).to.be.greaterThan(lastCommitStamp);
                      lastCommitStamp = evt.commitStamp.getTime();
                    });
                    
                    done();
                  });
                  
                });

                describe('with a skip value', function () {

                  it('it should return the correct values', function (done) {

                    var expectedEvts = allEvents.slice(3);
                    
                    store.getEvents({}, 3, -1, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(expectedEvts.length);

                      var lastCommitStamp = 0;
                      _.each(evts, function (evt) {
                        expect(evt.commitStamp.getTime()).to.be.greaterThan(lastCommitStamp);
                        lastCommitStamp = evt.commitStamp.getTime();
                      });

                      done();
                    });

                  });

                });

                describe('with a limit value', function () {

                  it('it should return the correct values', function (done) {

                    var expectedEvts = allEvents.slice(0, 5);

                    store.getEvents({}, 0, 5, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(expectedEvts.length);

                      var lastCommitStamp = 0;
                      _.each(evts, function (evt) {
                        expect(evt.commitStamp.getTime()).to.be.greaterThan(lastCommitStamp);
                        lastCommitStamp = evt.commitStamp.getTime();
                      });

                      done();
                    });

                  });

                });

                describe('with a skip and a limit value', function () {

                  it('it should return the correct values', function (done) {

                    var expectedEvts = allEvents.slice(3, 5);

                    store.getEvents({}, 3, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(expectedEvts.length);

                      var lastCommitStamp = 0;
                      _.each(evts, function (evt) {
                        expect(evt.commitStamp.getTime()).to.be.greaterThan(lastCommitStamp);
                        lastCommitStamp = evt.commitStamp.getTime();
                      });

                      done();
                    });

                  });

                });
                
              });

              describe('with an aggregateId being used only in one context and aggregate', function () {

                it('it should return the correct events', function (done) {

                  store.getEvents({ aggregateId: 'idWithAgg' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(2);
                    expect(evts[0].aggregateId).to.eql(stream2[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream2[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream2[0].streamRevision);
                    expect(evts[1].aggregateId).to.eql(stream2[1].aggregateId);
                    expect(evts[1].commitStamp.getTime()).to.eql(stream2[1].commitStamp.getTime());
                    expect(evts[1].streamRevision).to.eql(stream2[1].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEvents({ aggregateId: 'idWithAgg' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(1);
                      expect(evts[0].aggregateId).to.eql(stream2[1].aggregateId);
                      expect(evts[0].commitStamp.getTime()).to.eql(stream2[1].commitStamp.getTime());
                      expect(evts[0].streamRevision).to.eql(stream2[1].streamRevision);

                      done();
                    });

                  });

                });

              });

              describe('with an aggregateId being used in an other context or aggregate', function () {

                it('it should return the correct events', function (done) {

                  store.getEvents({ aggregateId: 'id' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(5);
                    expect(evts[0].aggregateId).to.eql(stream1[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream1[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream1[0].streamRevision);
                    expect(evts[1].aggregateId).to.eql(stream1[1].aggregateId);
                    expect(evts[1].commitStamp.getTime()).to.eql(stream1[1].commitStamp.getTime());
                    expect(evts[1].streamRevision).to.eql(stream1[1].streamRevision);
                    expect(evts[2].aggregateId).to.eql(stream3[0].aggregateId);
                    expect(evts[2].commitStamp.getTime()).to.eql(stream3[0].commitStamp.getTime());
                    expect(evts[2].streamRevision).to.eql(stream3[0].streamRevision);
                    expect(evts[3].aggregateId).to.eql(stream5[0].aggregateId);
                    expect(evts[3].commitStamp.getTime()).to.eql(stream5[0].commitStamp.getTime());
                    expect(evts[3].streamRevision).to.eql(stream5[0].streamRevision);
                    expect(evts[4].aggregateId).to.eql(stream10[0].aggregateId);
                    expect(evts[4].commitStamp.getTime()).to.eql(stream10[0].commitStamp.getTime());
                    expect(evts[4].streamRevision).to.eql(stream10[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with revMin and revMax', function () {

                  it('it should return the correct events', function (done) {

                    store.getEvents({ aggregateId: 'id' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(2);
                      expect(evts[0].aggregateId).to.eql(stream1[1].aggregateId);
                      expect(evts[0].commitStamp.getTime()).to.eql(stream1[1].commitStamp.getTime());
                      expect(evts[0].streamRevision).to.eql(stream1[1].streamRevision);

                      done();
                    });

                  });

                });

              });

              describe('without an aggregateId but with an aggregate', function () {

                it('it should return the correct events', function (done) {

                  store.getEvents({ aggregate: 'myAggrrr2' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(3);
                    expect(evts[0].aggregateId).to.eql(stream7[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream7[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream7[0].streamRevision);
                    expect(evts[1].aggregateId).to.eql(stream7[1].aggregateId);
                    expect(evts[1].commitStamp.getTime()).to.eql(stream7[1].commitStamp.getTime());
                    expect(evts[1].streamRevision).to.eql(stream7[1].streamRevision);
                    expect(evts[2].aggregateId).to.eql(stream9[0].aggregateId);
                    expect(evts[2].commitStamp.getTime()).to.eql(stream9[0].commitStamp.getTime());
                    expect(evts[2].streamRevision).to.eql(stream9[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEvents({ aggregate: 'myAggrrr2' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(2);
                      expect(evts[0].aggregateId).to.eql(stream7[1].aggregateId);
                      expect(evts[0].commitStamp.getTime()).to.eql(stream7[1].commitStamp.getTime());
                      expect(evts[0].streamRevision).to.eql(stream7[1].streamRevision);
                      expect(evts[1].aggregateId).to.eql(stream9[0].aggregateId);
                      expect(evts[1].commitStamp.getTime()).to.eql(stream9[0].commitStamp.getTime());
                      expect(evts[1].streamRevision).to.eql(stream9[0].streamRevision);

                      done();
                    });

                  });

                });

              });

              describe('with an aggregateId and with an aggregate', function () {

                it('it should return the correct events', function (done) {

                  store.getEvents({ aggregate: 'myAggrrr2', aggregateId: 'idWithAggrAndCont' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(1);
                    expect(evts[0].aggregateId).to.eql(stream9[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream9[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream9[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEvents({ aggregate: 'myAggrrr2', aggregateId: 'idWithAggrAndCont' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(0);

                      done();
                    });

                  });

                });

              });

              describe('with an aggregateId and without an aggregate but with a context', function () {

                it('it should return the correct events', function (done) {

                  store.getEvents({ aggregateId: 'idWithAggrAndCont', context: 'myConttttt' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(3);
                    expect(evts[0].aggregateId).to.eql(stream6[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream6[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream6[0].streamRevision);
                    expect(evts[1].aggregateId).to.eql(stream6[1].aggregateId);
                    expect(evts[1].commitStamp.getTime()).to.eql(stream6[1].commitStamp.getTime());
                    expect(evts[1].streamRevision).to.eql(stream6[1].streamRevision);
                    expect(evts[2].aggregateId).to.eql(stream9[0].aggregateId);
                    expect(evts[2].commitStamp.getTime()).to.eql(stream9[0].commitStamp.getTime());
                    expect(evts[2].streamRevision).to.eql(stream9[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEvents({ aggregateId: 'idWithAggrAndCont', context: 'myConttttt' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(2);
                      expect(evts[0].aggregateId).to.eql(stream6[1].aggregateId);
                      expect(evts[0].commitStamp.getTime()).to.eql(stream6[1].commitStamp.getTime());
                      expect(evts[0].streamRevision).to.eql(stream6[1].streamRevision);
                      expect(evts[1].aggregateId).to.eql(stream9[0].aggregateId);
                      expect(evts[1].commitStamp.getTime()).to.eql(stream9[0].commitStamp.getTime());
                      expect(evts[1].streamRevision).to.eql(stream9[0].streamRevision);

                      done();
                    });

                  });

                });

              });
              
              describe('with an aggregateId and with an aggregate and with a context', function () {

                it('it should return the correct events', function (done) {

                  store.getEvents({ aggregateId: 'id', aggregate: 'wowAgg', context: 'wowCont' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(1);
                    expect(evts[0].aggregateId).to.eql(stream10[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream10[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream10[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEvents({ aggregateId: 'id', aggregate: 'wowAgg', context: 'wowCont' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(0);

                      done();
                    });

                  });

                });

              });

              describe('without an aggregateId and without an aggregate but with a context', function () {

                it('it should return the correct events', function (done) {

                  store.getEvents({ context: 'myCont' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(3);
                    expect(evts[0].aggregateId).to.eql(stream4[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream4[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream4[0].streamRevision);
                    expect(evts[1].aggregateId).to.eql(stream4[1].aggregateId);
                    expect(evts[1].commitStamp.getTime()).to.eql(stream4[1].commitStamp.getTime());
                    expect(evts[1].streamRevision).to.eql(stream4[1].streamRevision);
                    expect(evts[2].aggregateId).to.eql(stream5[0].aggregateId);
                    expect(evts[2].commitStamp.getTime()).to.eql(stream5[0].commitStamp.getTime());
                    expect(evts[2].streamRevision).to.eql(stream5[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEvents({ context: 'myCont' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(2);
                      expect(evts[0].aggregateId).to.eql(stream4[1].aggregateId);
                      expect(evts[0].commitStamp.getTime()).to.eql(stream4[1].commitStamp.getTime());
                      expect(evts[0].streamRevision).to.eql(stream4[1].streamRevision);
                      expect(evts[1].aggregateId).to.eql(stream5[0].aggregateId);
                      expect(evts[1].commitStamp.getTime()).to.eql(stream5[0].commitStamp.getTime());
                      expect(evts[1].streamRevision).to.eql(stream5[0].streamRevision);

                      done();
                    });

                  });

                });

              });

              describe('without an aggregateId but with an aggregate and with a context', function () {

                it('it should return the correct events', function (done) {

                  store.getEvents({ context: 'myConttttt', aggregate: 'myAggrrr' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(3);
                    expect(evts[0].aggregateId).to.eql(stream6[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream6[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream6[0].streamRevision);
                    expect(evts[1].aggregateId).to.eql(stream6[1].aggregateId);
                    expect(evts[1].commitStamp.getTime()).to.eql(stream6[1].commitStamp.getTime());
                    expect(evts[1].streamRevision).to.eql(stream6[1].streamRevision);
                    expect(evts[2].aggregateId).to.eql(stream8[0].aggregateId);
                    expect(evts[2].commitStamp.getTime()).to.eql(stream8[0].commitStamp.getTime());
                    expect(evts[2].streamRevision).to.eql(stream8[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEvents({ context: 'myConttttt', aggregate: 'myAggrrr' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(2);
                      expect(evts[0].aggregateId).to.eql(stream6[1].aggregateId);
                      expect(evts[0].commitStamp.getTime()).to.eql(stream6[1].commitStamp.getTime());
                      expect(evts[0].streamRevision).to.eql(stream6[1].streamRevision);
                      expect(evts[1].aggregateId).to.eql(stream8[0].aggregateId);
                      expect(evts[1].commitStamp.getTime()).to.eql(stream8[0].commitStamp.getTime());
                      expect(evts[1].streamRevision).to.eql(stream8[0].streamRevision);

                      done();
                    });

                  });

                });

              });

            });
            
            describe('calling getEventsByRevision', function () {
              
              describe('with an aggregateId being used only in one context and aggregate', function () {
                
                it('it should return the correct events', function (done) {
                  
                  store.getEventsByRevision({ aggregateId: 'idWithAgg' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(2);
                    expect(evts[0].aggregateId).to.eql(stream2[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream2[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream2[0].streamRevision);
                    expect(evts[1].aggregateId).to.eql(stream2[1].aggregateId);
                    expect(evts[1].commitStamp.getTime()).to.eql(stream2[1].commitStamp.getTime());
                    expect(evts[1].streamRevision).to.eql(stream2[1].streamRevision);
                    
                    done();
                  });
                  
                });

                describe('and limit it with revMin and revMax', function () {

                  it('it should return the correct events', function (done) {

                    store.getEventsByRevision({ aggregateId: 'idWithAgg' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(1);
                      expect(evts[0].aggregateId).to.eql(stream2[1].aggregateId);
                      expect(evts[0].commitStamp.getTime()).to.eql(stream2[1].commitStamp.getTime());
                      expect(evts[0].streamRevision).to.eql(stream2[1].streamRevision);

                      done();
                    });

                  });

                });
                
              });

              describe('with an aggregateId being used in an other context or aggregate', function () {

                it('it should return the correct events', function (done) {

                  store.getEventsByRevision({ aggregateId: 'id' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(5);
                    expect(evts[0].aggregateId).to.eql(stream1[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream1[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream1[0].streamRevision);
                    expect(evts[1].aggregateId).to.eql(stream1[1].aggregateId);
                    expect(evts[1].commitStamp.getTime()).to.eql(stream1[1].commitStamp.getTime());
                    expect(evts[1].streamRevision).to.eql(stream1[1].streamRevision);
                    expect(evts[2].aggregateId).to.eql(stream3[0].aggregateId);
                    expect(evts[2].commitStamp.getTime()).to.eql(stream3[0].commitStamp.getTime());
                    expect(evts[2].streamRevision).to.eql(stream3[0].streamRevision);
                    expect(evts[3].aggregateId).to.eql(stream5[0].aggregateId);
                    expect(evts[3].commitStamp.getTime()).to.eql(stream5[0].commitStamp.getTime());
                    expect(evts[3].streamRevision).to.eql(stream5[0].streamRevision);
                    expect(evts[4].aggregateId).to.eql(stream10[0].aggregateId);
                    expect(evts[4].commitStamp.getTime()).to.eql(stream10[0].commitStamp.getTime());
                    expect(evts[4].streamRevision).to.eql(stream10[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with revMin and revMax', function () {

                  it('it should return the correct events', function (done) {

                    store.getEventsByRevision({ aggregateId: 'id' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(1);
                      expect(evts[0].aggregateId).to.eql(stream1[1].aggregateId);
                      expect(evts[0].commitStamp.getTime()).to.eql(stream1[1].commitStamp.getTime());
                      expect(evts[0].streamRevision).to.eql(stream1[1].streamRevision);

                      done();
                    });

                  });

                });

              });

              describe('with an aggregateId and with an aggregate', function () {

                it('it should return the correct events', function (done) {

                  store.getEventsByRevision({ aggregate: 'myAggrrr2', aggregateId: 'idWithAggrAndCont' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(1);
                    expect(evts[0].aggregateId).to.eql(stream9[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream9[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream9[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEventsByRevision({ aggregate: 'myAggrrr2', aggregateId: 'idWithAggrAndCont' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(0);

                      done();
                    });

                  });

                });

                describe('and an other combination of limit and skip', function () {

                  it('it should return the correct events', function (done) {

                    store.getEventsByRevision({ aggregate: 'myAggrrr2', aggregateId: 'idWithAggrAndCont' }, 0, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(1);

                      done();
                    });

                  });

                });

              });

              describe('with an aggregateId and with an aggregate and with a context', function () {

                it('it should return the correct events', function (done) {

                  store.getEventsByRevision({ aggregateId: 'id', aggregate: 'wowAgg', context: 'wowCont' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(1);
                    expect(evts[0].aggregateId).to.eql(stream10[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream10[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream10[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEventsByRevision({ aggregateId: 'id', aggregate: 'wowAgg', context: 'wowCont' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(0);

                      done();
                    });

                  });

                });

                describe('and an other combination of limit and skip', function () {

                  it('it should return the correct events', function (done) {

                    store.getEventsByRevision({ aggregateId: 'id', aggregate: 'wowAgg', context: 'wowCont' }, 0, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(1);

                      done();
                    });

                  });

                });

              });

              describe('with an aggregateId and without an aggregate but with a context', function () {

                it('it should return the correct events', function (done) {

                  store.getEventsByRevision({ aggregateId: 'idWithAggrAndCont', context: 'myConttttt' }, 0, -1, function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(3);
                    expect(evts[0].aggregateId).to.eql(stream6[0].aggregateId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream6[0].commitStamp.getTime());
                    expect(evts[0].streamRevision).to.eql(stream6[0].streamRevision);
                    expect(evts[1].aggregateId).to.eql(stream6[1].aggregateId);
                    expect(evts[1].commitStamp.getTime()).to.eql(stream6[1].commitStamp.getTime());
                    expect(evts[1].streamRevision).to.eql(stream6[1].streamRevision);
                    expect(evts[2].aggregateId).to.eql(stream9[0].aggregateId);
                    expect(evts[2].commitStamp.getTime()).to.eql(stream9[0].commitStamp.getTime());
                    expect(evts[2].streamRevision).to.eql(stream9[0].streamRevision);

                    done();
                  });

                });

                describe('and limit it with skip and limit', function () {

                  it('it should return the correct events', function (done) {

                    store.getEventsByRevision({ aggregateId: 'idWithAggrAndCont', context: 'myConttttt' }, 1, 2, function (err, evts) {
                      expect(err).not.to.be.ok();
                      expect(evts.length).to.eql(1);
                      expect(evts[0].aggregateId).to.eql(stream6[1].aggregateId);
                      expect(evts[0].commitStamp.getTime()).to.eql(stream6[1].commitStamp.getTime());
                      expect(evts[0].streamRevision).to.eql(stream6[1].streamRevision);

                      done();
                    });

                  });

                });

              });
              
            });
            
          });

          describe('adding some events', function () {

            var stream = [{
              aggregateId: 'id',
              streamRevision: 0,
              commitId: '119',
              commitStamp: new Date(Date.now() + 10),
              payload: {
                event:'bla'
              }
            }, {
              aggregateId: 'id',
              streamRevision: 1,
              commitId: '120',
              commitStamp: new Date(Date.now() + 20),
              payload: {
                event:'bla2'
              }
            }];
            
            beforeEach(function (done) {
              store.addEvents(stream, done);
            });

            describe('and requesting all undispatched events', function () {
              
              it('it should return the correct events', function (done) {
                
                store.getUndispatchedEvents(function (err, evts) {
                  expect(err).not.to.be.ok();
                  expect(evts.length).to.eql(2);
                  expect(evts[0].commitId).to.eql(stream[0].commitId);
                  expect(evts[0].commitStamp.getTime()).to.eql(stream[0].commitStamp.getTime());
                  expect(evts[1].commitId).to.eql(stream[1].commitId);
                  expect(evts[1].commitStamp.getTime()).to.eql(stream[1].commitStamp.getTime());
                  
                  done();
                });
                
              });
              
            });
            
            describe('calling setEventToDispatched', function () {
              
              beforeEach(function (done) {
                store.getUndispatchedEvents(function (err, evts) {
                  expect(evts.length).to.eql(2);
                  done();
                });
              });
              
              it('it should work correctly', function (done) {

                store.setEventToDispatched('119', function (err) {
                  expect(err).not.to.be.ok();

                  store.getUndispatchedEvents(function (err, evts) {
                    expect(err).not.to.be.ok();
                    expect(evts.length).to.eql(1);
                    expect(evts[0].commitId).to.eql(stream[1].commitId);
                    expect(evts[0].commitStamp.getTime()).to.eql(stream[1].commitStamp.getTime());
                    
                    done();
                  });
                });
                
              });
              
            });

          });
          
        });
        
      });
      
    });
    
  });

});
  