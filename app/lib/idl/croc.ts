/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/croc.json`.
 */
export type Croc = {
  "address": "F91YBp47Bk8MVGNnPK3edQfrwJLv9eDWRXzfHiVUXk4k",
  "metadata": {
    "name": "croc",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "callbackCheckTooth",
      "docs": [
        "VRF callback to check the pressed tooth",
        "Each tooth has 1/teeth_left probability of being the bad tooth"
      ],
      "discriminator": [
        233,
        18,
        56,
        134,
        2,
        99,
        7,
        37
      ],
      "accounts": [
        {
          "name": "vrfProgramIdentity",
          "docs": [
            "This check ensures that the vrf_program_identity (which is a PDA) is a signer",
            "enforcing the callback is executed by the VRF program through CPI"
          ],
          "signer": true,
          "address": "9irBy75QS2BN81FUgXuHcjqceJJRuc9oDkAe8TKVvvAw"
        },
        {
          "name": "game",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "randomness",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "delegate",
      "docs": [
        "Delegate the game account to use the VRF in the ephemeral rollups"
      ],
      "discriminator": [
        90,
        147,
        75,
        178,
        85,
        88,
        4,
        137
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bufferGame",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "game"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                210,
                16,
                223,
                21,
                46,
                255,
                101,
                9,
                100,
                62,
                240,
                240,
                222,
                233,
                111,
                106,
                184,
                180,
                155,
                206,
                18,
                24,
                160,
                132,
                83,
                144,
                213,
                167,
                55,
                9,
                5,
                5
              ]
            }
          }
        },
        {
          "name": "delegationRecordGame",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "game"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataGame",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "game"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  111,
                  99,
                  95,
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "gameIndex"
              }
            ]
          }
        },
        {
          "name": "ownerProgram",
          "address": "F91YBp47Bk8MVGNnPK3edQfrwJLv9eDWRXzfHiVUXk4k"
        },
        {
          "name": "delegationProgram",
          "address": "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameIndex",
          "type": "u32"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize a new Croc Dentist game"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  111,
                  99,
                  95,
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "gameIndex"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameIndex",
          "type": "u32"
        }
      ]
    },
    {
      "name": "pressToothDelegated",
      "docs": [
        "Press a tooth - delegated version for ephemeral rollups",
        "game_index: which game to play",
        "tooth_index: which tooth to press (0 to TOTAL_TEETH-1)",
        "client_seed: random seed from client for VRF"
      ],
      "discriminator": [
        2,
        154,
        183,
        29,
        246,
        213,
        60,
        213
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  111,
                  99,
                  95,
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "gameIndex"
              }
            ]
          }
        },
        {
          "name": "oracleQueue",
          "writable": true,
          "address": "5hBR571xnXppuCPveTrctfTU7tJLSN94nq7kv7FRK5Tc"
        },
        {
          "name": "programIdentity",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "vrfProgram",
          "address": "Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz"
        },
        {
          "name": "slotHashes",
          "address": "SysvarS1otHashes111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameIndex",
          "type": "u32"
        },
        {
          "name": "toothIndex",
          "type": "u8"
        },
        {
          "name": "clientSeed",
          "type": "u8"
        }
      ]
    },
    {
      "name": "processUndelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "accountSeeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "undelegate",
      "docs": [
        "Undelegate the game account"
      ],
      "discriminator": [
        131,
        148,
        180,
        198,
        91,
        104,
        42,
        238
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  111,
                  99,
                  95,
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "gameIndex"
              }
            ]
          }
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameIndex",
          "type": "u32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "gameAlreadyOver",
      "msg": "Game is already over"
    },
    {
      "code": 6001,
      "name": "invalidToothIndex",
      "msg": "Invalid tooth index"
    },
    {
      "code": 6002,
      "name": "toothAlreadyPressed",
      "msg": "Tooth has already been pressed"
    }
  ],
  "types": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameIndex",
            "docs": [
              "Game index identifier"
            ],
            "type": "u32"
          },
          {
            "name": "pressedTeeth",
            "docs": [
              "Bitmap of pressed teeth (bit set = tooth pressed)"
            ],
            "type": "u16"
          },
          {
            "name": "totalTeeth",
            "docs": [
              "Total number of teeth in the game"
            ],
            "type": "u8"
          },
          {
            "name": "gameOver",
            "docs": [
              "Whether the game is over"
            ],
            "type": "bool"
          },
          {
            "name": "winner",
            "docs": [
              "Winner if avoided all bites"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "teethPressedCount",
            "docs": [
              "Count of teeth pressed"
            ],
            "type": "u8"
          },
          {
            "name": "currentTooth",
            "docs": [
              "Current tooth being checked (for VRF callback)"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
