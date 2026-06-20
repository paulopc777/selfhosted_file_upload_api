import { AUTH_TOKEN } from '../../config/contants'
import { FastifyRequest, FastifyReply } from 'fastify'

export const authMiddleware = (req: FastifyRequest, res: FastifyReply, done: () => void) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        res.status(401).send({
            error: 'Token de autorização não fornecido',
        })
        return
    }

    // Extract token from "Bearer TOKEN" or just "TOKEN"
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader

    if (token !== AUTH_TOKEN) {
        res.status(401).send({ error: 'Token de autorização inválido' })
        return
    }
    done()
}
