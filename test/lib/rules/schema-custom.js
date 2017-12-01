'use strict';

const assert = require('chai').assert;
const schemaCustomRule = require('../../../lib/rules/schema-custom');

describe('schema-custom', () => {
  describe('type = object must have non-whitespace titles', () => {
    const options = {
      whenField: 'type',
      whenPattern: 'object',
      thenField: 'title',
      thenPattern: '\\s'
    };

    it('should not report errors when titles are present and valid', () => {
      const schema = {
        definitions: {
          Pet: {
            type: 'object',
            title: 'Pet title',
            properties: {
              country_code: {
                type: 'string'
              }
            }
          },
          Pets: {
            type: 'array',
            items: {
              $ref: '#/definitions/Pet'
            }
          }
        },
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  in: 'body',
                  schema: {
                    title: 'Body schema',
                    type: 'object'
                  }
                }
              ],
              responses: {
                200: {
                  schema: {
                    $ref: '#/definitions/Pets'
                  }
                }
              }
            },
            put: {
              parameters: [
                {
                  in: 'body',
                  schema: {
                    allOf: [
                      {
                        type: 'object',
                        title: 'allOf object title'
                      },
                      {
                        type: 'object',
                        title: 'allOf 2 object title'
                      },
                      {
                        type: 'string'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      };

      const failures = schemaCustomRule.validate(options, schema);

      assert.equal(failures.size, 0);
    });


    it('should report errors when titles are not present', () => {
      const schema = {
        definitions: {
          Pet: {
            type: 'object',
            properties: {
              country_code: {
                type: 'string'
              }
            }
          },
          Pets: {
            type: 'array',
            items: {
              $ref: '#/definitions/Pet'
            }
          }
        },
        paths: {
          '/pets': {
            get: {
              parameters: [
                {
                  in: 'body',
                  schema: {
                    type: 'object'
                  }
                }
              ],
              responses: {
                200: {
                  schema: {
                    $ref: '#/definitions/Pets'
                  }
                }
              }
            },
            put: {
              parameters: [
                {
                  in: 'body',
                  schema: {
                    allOf: [
                      {
                        type: 'object'
                      },
                      {
                        type: 'object'
                      },
                      {
                        type: 'string'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      };

      const failures = schemaCustomRule.validate([options], schema);

      assert.equal(failures.size, 4);
      assert.equal(failures.get(0).get('location'), 'paths./pets.get.parameters[0].schema');
      assert.equal(failures.get(0).get('hint'), 'Expected schema title:"undefined" to match "\\s"');
      assert.equal(failures.get(1).get('location'), 'paths./pets.get.responses.200.schema.items');
      assert.equal(failures.get(1).get('hint'), 'Expected schema title:"undefined" to match "\\s"');
      assert.equal(failures.get(2).get('location'), 'paths./pets.put.parameters[0].schema.allOf[0]');
      assert.equal(failures.get(2).get('hint'), 'Expected schema title:"undefined" to match "\\s"');
      assert.equal(failures.get(3).get('location'), 'paths./pets.put.parameters[0].schema.allOf[1]');
      assert.equal(failures.get(3).get('hint'), 'Expected schema title:"undefined" to match "\\s"');
    });
  });
});