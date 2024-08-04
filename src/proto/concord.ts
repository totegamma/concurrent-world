/* eslint-disable */
import _m0 from 'protobufjs/minimal'
import { Params } from './params'

export const protobufPackage = 'concord.badge'

/** MsgUpdateParams is the Msg/UpdateParams request type. */
export interface MsgUpdateParams {
    /** authority is the address that controls the module (defaults to x/gov unless overwritten). */
    authority: string
    /** NOTE: All parameters must be supplied. */
    params: Params | undefined
}

/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 */
export interface MsgUpdateParamsResponse {}

export interface MsgCreateTemplate {
    creator: string
    name: string
    description: string
    uri: string
    transferable: boolean
}

export interface MsgCreateTemplateResponse {
    id: string
}

export interface MsgMintBadge {
    creator: string
    class: string
    receiver: string
}

export interface MsgMintBadgeResponse {
    id: string
}

function createBaseMsgUpdateParams(): MsgUpdateParams {
    return { authority: '', params: undefined }
}

export const MsgUpdateParams = {
    encode(message: MsgUpdateParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.authority !== '') {
            writer.uint32(10).string(message.authority)
        }
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(18).fork()).ldelim()
        }
        return writer
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateParams {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input)
        let end = length === undefined ? reader.len : reader.pos + length
        const message = createBaseMsgUpdateParams()
        while (reader.pos < end) {
            const tag = reader.uint32()
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break
                    }

                    message.authority = reader.string()
                    continue
                case 2:
                    if (tag !== 18) {
                        break
                    }

                    message.params = Params.decode(reader, reader.uint32())
                    continue
            }
            if ((tag & 7) === 4 || tag === 0) {
                break
            }
            reader.skipType(tag & 7)
        }
        return message
    },

    fromJSON(object: any): MsgUpdateParams {
        return {
            authority: isSet(object.authority) ? String(object.authority) : '',
            params: isSet(object.params) ? Params.fromJSON(object.params) : undefined
        }
    },

    toJSON(message: MsgUpdateParams): unknown {
        const obj: any = {}
        if (message.authority !== '') {
            obj.authority = message.authority
        }
        if (message.params !== undefined) {
            obj.params = Params.toJSON(message.params)
        }
        return obj
    },

    create<I extends Exact<DeepPartial<MsgUpdateParams>, I>>(base?: I): MsgUpdateParams {
        return MsgUpdateParams.fromPartial(base ?? ({} as any))
    },
    fromPartial<I extends Exact<DeepPartial<MsgUpdateParams>, I>>(object: I): MsgUpdateParams {
        const message = createBaseMsgUpdateParams()
        message.authority = object.authority ?? ''
        message.params =
            object.params !== undefined && object.params !== null ? Params.fromPartial(object.params) : undefined
        return message
    }
}

function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
    return {}
}

export const MsgUpdateParamsResponse = {
    encode(_: MsgUpdateParamsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        return writer
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateParamsResponse {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input)
        let end = length === undefined ? reader.len : reader.pos + length
        const message = createBaseMsgUpdateParamsResponse()
        while (reader.pos < end) {
            const tag = reader.uint32()
            switch (tag >>> 3) {
            }
            if ((tag & 7) === 4 || tag === 0) {
                break
            }
            reader.skipType(tag & 7)
        }
        return message
    },

    fromJSON(_: any): MsgUpdateParamsResponse {
        return {}
    },

    toJSON(_: MsgUpdateParamsResponse): unknown {
        const obj: any = {}
        return obj
    },

    create<I extends Exact<DeepPartial<MsgUpdateParamsResponse>, I>>(base?: I): MsgUpdateParamsResponse {
        return MsgUpdateParamsResponse.fromPartial(base ?? ({} as any))
    },
    fromPartial<I extends Exact<DeepPartial<MsgUpdateParamsResponse>, I>>(_: I): MsgUpdateParamsResponse {
        const message = createBaseMsgUpdateParamsResponse()
        return message
    }
}

function createBaseMsgCreateTemplate(): MsgCreateTemplate {
    return { creator: '', name: '', description: '', uri: '', transferable: false }
}

export const MsgCreateTemplate = {
    encode(message: MsgCreateTemplate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator)
        }
        if (message.name !== '') {
            writer.uint32(18).string(message.name)
        }
        if (message.description !== '') {
            writer.uint32(26).string(message.description)
        }
        if (message.uri !== '') {
            writer.uint32(34).string(message.uri)
        }
        if (message.transferable === true) {
            writer.uint32(40).bool(message.transferable)
        }
        return writer
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateTemplate {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input)
        let end = length === undefined ? reader.len : reader.pos + length
        const message = createBaseMsgCreateTemplate()
        while (reader.pos < end) {
            const tag = reader.uint32()
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break
                    }

                    message.creator = reader.string()
                    continue
                case 2:
                    if (tag !== 18) {
                        break
                    }

                    message.name = reader.string()
                    continue
                case 3:
                    if (tag !== 26) {
                        break
                    }

                    message.description = reader.string()
                    continue
                case 4:
                    if (tag !== 34) {
                        break
                    }

                    message.uri = reader.string()
                    continue
                case 5:
                    if (tag !== 40) {
                        break
                    }

                    message.transferable = reader.bool()
                    continue
            }
            if ((tag & 7) === 4 || tag === 0) {
                break
            }
            reader.skipType(tag & 7)
        }
        return message
    },

    fromJSON(object: any): MsgCreateTemplate {
        return {
            creator: isSet(object.creator) ? String(object.creator) : '',
            name: isSet(object.name) ? String(object.name) : '',
            description: isSet(object.description) ? String(object.description) : '',
            uri: isSet(object.uri) ? String(object.uri) : '',
            transferable: isSet(object.transferable) ? Boolean(object.transferable) : false
        }
    },

    toJSON(message: MsgCreateTemplate): unknown {
        const obj: any = {}
        if (message.creator !== '') {
            obj.creator = message.creator
        }
        if (message.name !== '') {
            obj.name = message.name
        }
        if (message.description !== '') {
            obj.description = message.description
        }
        if (message.uri !== '') {
            obj.uri = message.uri
        }
        if (message.transferable === true) {
            obj.transferable = message.transferable
        }
        return obj
    },

    create<I extends Exact<DeepPartial<MsgCreateTemplate>, I>>(base?: I): MsgCreateTemplate {
        return MsgCreateTemplate.fromPartial(base ?? ({} as any))
    },
    fromPartial<I extends Exact<DeepPartial<MsgCreateTemplate>, I>>(object: I): MsgCreateTemplate {
        const message = createBaseMsgCreateTemplate()
        message.creator = object.creator ?? ''
        message.name = object.name ?? ''
        message.description = object.description ?? ''
        message.uri = object.uri ?? ''
        message.transferable = object.transferable ?? false
        return message
    }
}

function createBaseMsgCreateTemplateResponse(): MsgCreateTemplateResponse {
    return { id: '' }
}

export const MsgCreateTemplateResponse = {
    encode(message: MsgCreateTemplateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.id !== '') {
            writer.uint32(10).string(message.id)
        }
        return writer
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateTemplateResponse {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input)
        let end = length === undefined ? reader.len : reader.pos + length
        const message = createBaseMsgCreateTemplateResponse()
        while (reader.pos < end) {
            const tag = reader.uint32()
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break
                    }

                    message.id = reader.string()
                    continue
            }
            if ((tag & 7) === 4 || tag === 0) {
                break
            }
            reader.skipType(tag & 7)
        }
        return message
    },

    fromJSON(object: any): MsgCreateTemplateResponse {
        return { id: isSet(object.id) ? String(object.id) : '' }
    },

    toJSON(message: MsgCreateTemplateResponse): unknown {
        const obj: any = {}
        if (message.id !== '') {
            obj.id = message.id
        }
        return obj
    },

    create<I extends Exact<DeepPartial<MsgCreateTemplateResponse>, I>>(base?: I): MsgCreateTemplateResponse {
        return MsgCreateTemplateResponse.fromPartial(base ?? ({} as any))
    },
    fromPartial<I extends Exact<DeepPartial<MsgCreateTemplateResponse>, I>>(object: I): MsgCreateTemplateResponse {
        const message = createBaseMsgCreateTemplateResponse()
        message.id = object.id ?? ''
        return message
    }
}

function createBaseMsgMintBadge(): MsgMintBadge {
    return { creator: '', class: '', receiver: '' }
}

export const MsgMintBadge = {
    encode(message: MsgMintBadge, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.creator !== '') {
            writer.uint32(10).string(message.creator)
        }
        if (message.class !== '') {
            writer.uint32(18).string(message.class)
        }
        if (message.receiver !== '') {
            writer.uint32(26).string(message.receiver)
        }
        return writer
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): MsgMintBadge {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input)
        let end = length === undefined ? reader.len : reader.pos + length
        const message = createBaseMsgMintBadge()
        while (reader.pos < end) {
            const tag = reader.uint32()
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break
                    }

                    message.creator = reader.string()
                    continue
                case 2:
                    if (tag !== 18) {
                        break
                    }

                    message.class = reader.string()
                    continue
                case 3:
                    if (tag !== 26) {
                        break
                    }

                    message.receiver = reader.string()
                    continue
            }
            if ((tag & 7) === 4 || tag === 0) {
                break
            }
            reader.skipType(tag & 7)
        }
        return message
    },

    fromJSON(object: any): MsgMintBadge {
        return {
            creator: isSet(object.creator) ? String(object.creator) : '',
            class: isSet(object.class) ? String(object.class) : '',
            receiver: isSet(object.receiver) ? String(object.receiver) : ''
        }
    },

    toJSON(message: MsgMintBadge): unknown {
        const obj: any = {}
        if (message.creator !== '') {
            obj.creator = message.creator
        }
        if (message.class !== '') {
            obj.class = message.class
        }
        if (message.receiver !== '') {
            obj.receiver = message.receiver
        }
        return obj
    },

    create<I extends Exact<DeepPartial<MsgMintBadge>, I>>(base?: I): MsgMintBadge {
        return MsgMintBadge.fromPartial(base ?? ({} as any))
    },
    fromPartial<I extends Exact<DeepPartial<MsgMintBadge>, I>>(object: I): MsgMintBadge {
        const message = createBaseMsgMintBadge()
        message.creator = object.creator ?? ''
        message.class = object.class ?? ''
        message.receiver = object.receiver ?? ''
        return message
    }
}

function createBaseMsgMintBadgeResponse(): MsgMintBadgeResponse {
    return { id: '' }
}

export const MsgMintBadgeResponse = {
    encode(message: MsgMintBadgeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
        if (message.id !== '') {
            writer.uint32(10).string(message.id)
        }
        return writer
    },

    decode(input: _m0.Reader | Uint8Array, length?: number): MsgMintBadgeResponse {
        const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input)
        let end = length === undefined ? reader.len : reader.pos + length
        const message = createBaseMsgMintBadgeResponse()
        while (reader.pos < end) {
            const tag = reader.uint32()
            switch (tag >>> 3) {
                case 1:
                    if (tag !== 10) {
                        break
                    }

                    message.id = reader.string()
                    continue
            }
            if ((tag & 7) === 4 || tag === 0) {
                break
            }
            reader.skipType(tag & 7)
        }
        return message
    },

    fromJSON(object: any): MsgMintBadgeResponse {
        return { id: isSet(object.id) ? String(object.id) : '' }
    },

    toJSON(message: MsgMintBadgeResponse): unknown {
        const obj: any = {}
        if (message.id !== '') {
            obj.id = message.id
        }
        return obj
    },

    create<I extends Exact<DeepPartial<MsgMintBadgeResponse>, I>>(base?: I): MsgMintBadgeResponse {
        return MsgMintBadgeResponse.fromPartial(base ?? ({} as any))
    },
    fromPartial<I extends Exact<DeepPartial<MsgMintBadgeResponse>, I>>(object: I): MsgMintBadgeResponse {
        const message = createBaseMsgMintBadgeResponse()
        message.id = object.id ?? ''
        return message
    }
}

/** Msg defines the Msg service. */
export interface Msg {
    /**
     * UpdateParams defines a (governance) operation for updating the module
     * parameters. The authority defaults to the x/gov module account.
     */
    UpdateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse>
    CreateTemplate(request: MsgCreateTemplate): Promise<MsgCreateTemplateResponse>
    MintBadge(request: MsgMintBadge): Promise<MsgMintBadgeResponse>
}

export const MsgServiceName = 'concord.badge.Msg'
export class MsgClientImpl implements Msg {
    private readonly rpc: Rpc
    private readonly service: string
    constructor(rpc: Rpc, opts?: { service?: string }) {
        this.service = opts?.service || MsgServiceName
        this.rpc = rpc
        this.UpdateParams = this.UpdateParams.bind(this)
        this.CreateTemplate = this.CreateTemplate.bind(this)
        this.MintBadge = this.MintBadge.bind(this)
    }
    UpdateParams(request: MsgUpdateParams): Promise<MsgUpdateParamsResponse> {
        const data = MsgUpdateParams.encode(request).finish()
        const promise = this.rpc.request(this.service, 'UpdateParams', data)
        return promise.then((data) => MsgUpdateParamsResponse.decode(_m0.Reader.create(data)))
    }

    CreateTemplate(request: MsgCreateTemplate): Promise<MsgCreateTemplateResponse> {
        const data = MsgCreateTemplate.encode(request).finish()
        const promise = this.rpc.request(this.service, 'CreateTemplate', data)
        return promise.then((data) => MsgCreateTemplateResponse.decode(_m0.Reader.create(data)))
    }

    MintBadge(request: MsgMintBadge): Promise<MsgMintBadgeResponse> {
        const data = MsgMintBadge.encode(request).finish()
        const promise = this.rpc.request(this.service, 'MintBadge', data)
        return promise.then((data) => MsgMintBadgeResponse.decode(_m0.Reader.create(data)))
    }
}

interface Rpc {
    request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined

export type DeepPartial<T> = T extends Builtin
    ? T
    : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends {}
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : Partial<T>

type KeysOfUnion<T> = T extends T ? keyof T : never
export type Exact<P, I extends P> = P extends Builtin
    ? P
    : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never }

function isSet(value: any): boolean {
    return value !== null && value !== undefined
}
