/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

const meta = require('../../../../local-cli/bundle/output/meta');

const {createIndexMap} = require('./source-map');
const {addModuleIdsToModuleWrapper} = require('./util');

import type {OutputFn} from '../types.flow';

module.exports = (
  (modules, filename, idForPath, sourceMapPath) => {
    let code = '';
    let line = 0;
    const sections = [];

    for (const module of modules) {
      const {file} = module;
      const moduleCode = file.type === 'module'
        ? addModuleIdsToModuleWrapper(module, idForPath)
        : file.code;

      code += moduleCode + '\n';
      if (file.map) {
        sections.push({
          map: file.map,
          offset: {column: 0, line},
        });
      }
      line += countLines(moduleCode);
    }

    if (sourceMapPath) {
      code += `/*# sourceMappingURL=${sourceMapPath}*/`;
    }

    return {
      code,
      extraFiles: [[`${filename}.meta`, meta(code)]],
      map: createIndexMap({file: filename, sections}),
    };
  }: OutputFn);

const reLine = /^/gm;
function countLines(string: string): number {
  //$FlowFixMe This regular expression always matches
  return string.match(reLine).length;
}
