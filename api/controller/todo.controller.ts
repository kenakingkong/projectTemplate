import DefaultController from "./default.controller";

import {NextFunction, Request, Response, Router} from "express";
import express from "express";

import {Session, ToDo} from "../entity";
import {getRepository } from "typeorm";

export class ToDoController extends DefaultController{
    protected initializeRoutes(): express.Router{
        const router = Router();

        debugger;
        router.route("/todos")
            .post((req:Request,res:Response) => {
                const token = req.get("token");
                const sessionRepo = getRepository(Session);
                const todoRepo = getRepository(ToDo);
                const todo = new ToDo();
                sessionRepo.findOne(token)
                    .then((foundSession: Session | undefined) =>{
                        const user = foundSession!.user;
                        todo.duedate = req.body.duedate;
                        todo.title = req.body.title;
                        todo.complete = false;
                        todo.user = user;
                        todoRepo.save(todo).then((savedTodo: ToDo) => {
                            res.status(200).send({todo});
                    });
                });
            })
            .get((req: Request, res: Response) => {
                const todoRepo = getRepository(ToDo);
                todoRepo.find().then((todo: ToDo[]) => {
                    res.status(200).send({ todo });
                });
            })
            .delete((req:Request, res: Response) =>{
                const todoRepo = getRepository(ToDo);
                todoRepo.findOneOrFail(req.params.id).then((foundToDo:ToDo)=>{
                    todoRepo.remove(foundToDo)
                });
            })
            .put((req:Request, res:Response) => {
                const todoRepo = getRepository(ToDo);
                todoRepo.findOneOrFail(req.params.id).then((foundToDo:ToDo)=>{
                    foundToDo.complete = req.body.complete;
                    todoRepo.save(foundToDo).then((updatedTodo: ToDo) => {
                        res.send(200).send({todo: updatedTodo});
                    });
                });
            })

            //for authentication???
            router.route("/todos/:id").put((req: Request, res: Response) => {
                const todoRepo = getRepository(ToDo);
                todoRepo.findOneOrFail(req.params.id).then((foundToDo: ToDo) => {
                  // save updates here
                  foundToDo.complete = req.body.complete;
                  todoRepo.save(foundToDo).then((updatedTodo: ToDo) => {
                    res.send(200).send({todo: updatedTodo});
                  });
                });
            })
            router.route("/todos/:id").get((req: Request, res: Response) => {
                const todoRepo = getRepository(ToDo);
                todoRepo.findOne(req.params.id).then((todo: ToDo | undefined) => {
                    if (todo) {
                      res.send({ todo });
                    } else {
                      res.sendStatus(404);
                    }
                  },
                  () => {
                    res.sendStatus(404);
                  }
                );
              });

         return router;
    }

}
