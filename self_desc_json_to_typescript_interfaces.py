import argparse
import json
import os
import glob

licence = """/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 """


def make_interface(name: str, data: dict) -> str:
    properties = []
    if "properties" in data["items"]:
        for p in data["items"]["properties"]:
            properties.append((p, data["items"]["properties"][p]["type"]))

            out = ""
            for i, p in enumerate(properties):
                n, t = p
                indent = newline = ""
                if i != len(properties):
                    indent = "  "
                    newline = "\n"

                out += f"{indent}{n}: {t};{newline}"

        return f"export interface {to_pascal_case(name)}Interface {{\n{out}}}\n"


def get_type(_type: str, v: dict, interface: str, name: str):
    type_conversions = {
        "integer": "number",
    }
    data_type = _type
    if type(_type) == list or _type == "array":
        if interface:
            data_type = to_pascal_case(name) + "Interface[]"
        else:
            if "enum" in v:
                data_type = "'" + "' | '".join(_type) + "'"
            else:
                data_type = " | ".join(_type)
    if data_type in type_conversions:
        data_type = type_conversions[data_type]

    return data_type

def schema_to_typescript(data: dict):
    keys = data['properties']
    interfaces = []
    properties = []
    indent = "  "

    for i, (name, v) in enumerate(keys.items()):
        interface = None

        if "items" in v:
            interface = make_interface(name, v)

        if interface:
            interfaces.append(interface)

        _type = v["type"] if not "enum" in v else v["enum"]
        optional = "?" if "null" in _type else ""
        data_type = get_type(_type, v, interface, name)
       
        newline = "\n"
        properties.append(f"{indent}/**\n" +
                          f"{indent} * {v['description']}\n" +
                          f"{indent} **/\n" +
                          f'{indent}{name}{optional}: {data_type};{newline if i < len(keys)-1 else ""}')

    return interfaces, properties

def to_pascal_case(s):
    return s.replace('_',' ').title().replace(' ','')

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--path", help="Path to your schema folder", type=str)
    parser.add_argument("-o", "--output", help="The file path to output to", type=str)
    args = parser.parse_args()
    to_write = ""

    if args.path:
        to_write += licence

    files = [y for x in os.walk(args.path) for y in glob.glob(os.path.join(x[0], '*-*-*'))]
    for file in files:
        with open(file, "r") as f:
            _json = json.loads(f.read())
            interfaces, properties = schema_to_typescript(_json)
            to_write += "\n".join(interfaces)
            to_write += f"export interface {to_pascal_case(_json['self']['name'])} {{\n"
            to_write += "\n".join(properties)
            to_write += "\n  [key: string]: unknown;\n}\n\n"

    if args.output:
        with open(args.output, "w") as f:
            f.write(to_write)
    else:
        print(to_write)