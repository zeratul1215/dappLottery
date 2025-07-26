"use client";

import { getLotteryContractAddresses } from "@/apis/firebase-database";
import SelectBox from "@/components/SelectBox";
import { useEffect, useState } from "react";

export default () => {
  const [selectedContractAddress, setSelectedContractAddress] =
    useState<string>("");

  const [contractAddresses, setContractAddresses] = useState<{
    [key: string]: { address: string };
  }>({});

  useEffect(() => {
    getLotteryContractAddresses().then((data) => {
      setContractAddresses(data);
    });
  }, []);

  return (
    <div>
      <div>
        <h1>Lottery</h1>
        <div>
          <SelectBox
            className="mb-4"
            label="choose the lottery you want to buy"
            options={Object.entries(contractAddresses).map(([key, value]) => ({
              label: key,
              value: value.address,
            }))}
            value={selectedContractAddress}
            onChange={setSelectedContractAddress}
            placeholder="select"
          />
        </div>
      </div>
    </div>
  );
};
