﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Ventillo;
using Ventillo.System;
using Ventillo.Interfaces;

namespace Ultimate_Tic_Tac_Toe.Game
{
    internal class TicTacToe : IGame
    {
        AI aI;
        bool aiActive = false;
        internal TicTacToe()
        {
            Engine.SetWindowTitle("Ultimate Tic Tac Toe");

            gameObjects.Add(new Grid(new Vector(Engine.playableArea.Max.x / 2, Engine.playableArea.Max.y / 2), gameObjects));
        }

        ~TicTacToe()
        {
            for (var gameObjectIndex = 0; gameObjectIndex < gameObjects.Count; gameObjectIndex++)
            {
                var gameObject = gameObjects.ElementAt(gameObjectIndex);

                DeleteGameObject(gameObject);
            }
        }

        public override void Update()
        {
            if (!aiActive)
            {
                foreach (var gameObject in gameObjects)
                {
                    if (gameObject is Grid)
                    {
                        var gridObject = gameObject as Grid;
                        gridObject.Update(aiActive);
                    }
                    else
                    {
                        gameObject.Update(gameObjects);
                    }
                }
            }
            // else
            // {
            //     this.aI.Update();
            // }

            CheckDelete();
        }
    }
}