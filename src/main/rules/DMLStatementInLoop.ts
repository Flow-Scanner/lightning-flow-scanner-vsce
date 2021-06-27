import {Flow} from "../models/Flow";
import FlowElement = require("../models/FlowElement");

export class DMLStatementInLoop{

    public execute(flow: Flow) {

        const dmlStatementTypes = ['recordLookups', 'recordDeletes', 'recordUpdates', 'recordCreates'];
        const flowElements: FlowElement[] = flow.nodes.filter(node => node.nodeType === 'element') as FlowElement[];
        const loopElements: FlowElement[] = flow.nodes.filter(node => node.subtype === 'loops') as FlowElement[];
        const dmlInLoopIndexes: number[] = [];

        for (const loopElement of loopElements) {
            let startOfLoop = flowElements.findIndex(element => element.name === this.findStartOfLoopReference(loopElement));
            let reachedEndOfLoop = false;
            let indexesToProcess: number [] = [startOfLoop];
            let processedLoopElementIndexes: number[] = [];
            do {
                indexesToProcess = indexesToProcess.filter(index => !processedLoopElementIndexes.includes(index));
                if (indexesToProcess.length > 0) {
                    for (const [index, element] of flowElements.entries()) {
                        if (indexesToProcess.includes(index)) {
                            let connectors = [];
                            for (let connector of element.connectors) {
                                if (connector.reference) {
                                    connectors.push(connector);
                                }
                            }
                            if(dmlStatementTypes.includes(element.subtype)) {
                                dmlInLoopIndexes.push(index);
                            }
                            if (connectors.length > 0) {
                                let elementsByReferences = flowElements.filter(element => connectors.map(c => c.reference).includes(element.name));
                                for (let nextElement of elementsByReferences) {
                                    let nextIndex = flowElements.findIndex(element => nextElement.name === element.name);
                                    if ("loops" === nextElement.subtype) {
                                        reachedEndOfLoop = true;
                                    }
                                    else if (!processedLoopElementIndexes.includes(nextIndex)) {
                                        indexesToProcess.push(nextIndex);
                                    }
                                }
                            }
                            processedLoopElementIndexes.push(index);
                        }
                    }
                }
            } while (reachedEndOfLoop === false);
        }

        const dmlStatementsInLoops: FlowElement[] = [];
        for (const [index, element] of flowElements.entries()) {
            if (dmlInLoopIndexes.includes(index)) {
                dmlStatementsInLoops.push(element);
            }
        }
        return dmlStatementsInLoops;
    }

    private findStartOfLoopReference(loopElement: FlowElement) {
        return loopElement.connectors.find(el => el.type === 'nextValueConnector').reference;
    }
}
