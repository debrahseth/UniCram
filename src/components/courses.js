export const courses = [
    {
        id: 'CENG-291',
        programOfStudy: 'Chemical Engineering',
        levelOfStudy: 'Level 200',
        semesterOfStudy: 'Semester 1',
        title: 'Engineering in Society',
        description: 'A course exploring the role of engineering in society and addressing fundamental engineering concepts, with a focus on mathematical applications and societal impact.',
        questions: [
          // Multiple-Choice Questions
          {
            question: 'What is the fundamental role of engineering in society?',
            options: ['A) To design and build new technologies', 'B) To solve societal problems through technological solutions','C) To study the history of engineering','D) To manufacture products at lower costs'],
            answer: 'B) To solve societal problems through technological solutions',
            difficulty: 'medium',
            type: 'multiple-choice'
          },
          {
            question: 'Which of the following is an example of civil engineering?',
            options: ['A) Designing circuits for electronics','B) Building roads and bridges','C) Programming software applications','D) Creating medical devices'],
            answer: 'B) Building roads and bridges',
            difficulty: 'medium',
            type: 'multiple-choice'
          },
          {
            question: 'Which engineering discipline primarily focuses on renewable energy sources?',
            options: ['A) Electrical Engineering','B) Civil Engineering','C) Environmental Engineering','D) Mechanical Engineering'],
            answer: 'C) Environmental Engineering',
            difficulty: 'medium',
            type: 'multiple-choice'
          },
          {
            question: 'What is the term used to describe the process of designing a product or service to meet human needs?',
            options: ['A) Product Development','B) Engineering Design','C) System Analysis','D) Technological Innovation'],
            answer: 'B) Engineering Design',
            difficulty: 'medium',
            type: 'multiple-choice'
          },
          {
            question: 'Which of the following engineers is most likely to work on the development of smart cities?',
            options: ['A) Chemical Engineer','B) Environmental Engineer','C) Software Engineer','D) Civil Engineer'],
            answer: 'D) Civil Engineer',
            difficulty: 'medium',
            type: 'multiple-choice'
          },
          {
            question: "Which of the following is a primary responsibility of an engineer working in sustainable development?",
            options: ["A) Designing new consumer electronics","B) Ensuring products meet environmental regulations","C) Creating software for video games","D) Developing military technology"],
            answer: "B) Ensuring products meet environmental regulations",
            difficulty: "medium",
            type: "multiple-choice"
          },
          {
            question: "Which engineering discipline is most involved in designing transportation infrastructure?",
            options: ["A) Mechanical Engineer","B) Civil Engineer","C) Electrical Engineer","D) Chemical Engineer"],
            answer: "B) Civil Engineer",
            difficulty: "medium",
            type: "multiple-choice"
          },
          {
            question: "In the context of engineering ethics, which of the following is considered a key aspect of a professional engineer's responsibility?",
            options: ["A) Maximizing profits for the company","B) Ensuring public health, safety, and welfare","C) Protecting intellectual property above all","D) Expanding market share globally"],
            answer: "B) Ensuring public health, safety, and welfare",
            difficulty: "hard",
            type: "multiple-choice"
          },
          {
            question: "Which of the following best describes the role of an industrial engineer in society?",
            options: ["A) Managing projects to improve manufacturing efficiency","B) Designing chemical processes for drug production","C) Developing energy-efficient software systems","D) Building bridges and highways"],
            answer: "A) Managing projects to improve manufacturing efficiency",
            difficulty: "medium",
            type: "multiple-choice"
          },
          {
            question: "Which type of engineering is most closely related to the development and maintenance of renewable energy systems?",
            options: ["A) Mechanical Engineering","B) Civil Engineering","C) Environmental Engineering","D) Electrical Engineering"],
            answer: "C) Environmental Engineering",
            difficulty: "medium",
            type: "multiple-choice"
          },
          {
            question: "Which of the following is a core value in engineering design to ensure the safety of the general public?",
            options: ["A) Profit maximization","B) Innovation for the sake of novelty","C) Risk analysis and mitigation","D) Brand recognition"],
            answer: "C) Risk analysis and mitigation",
            difficulty: "medium",
            type: "multiple-choice"
          },
          {
            question: "Which branch of engineering is most concerned with ensuring that products are energy efficient and environmentally friendly?",
            options: ["A) Electrical Engineering","B) Civil Engineering","C) Chemical Engineering","D) Environmental Engineering"],
            answer: "D) Environmental Engineering",
            difficulty: "medium",
            type: "multiple-choice"
          },
          {
            question: "What is the primary focus of a systems engineer in large-scale infrastructure projects?",
            options: ["A) Designing microchips","B) Coordinating and optimizing different subsystems","C) Developing chemical formulas","D) Building physical structures like bridges"],
            answer: "B) Coordinating and optimizing different subsystems",
            difficulty: "hard",
            type: "multiple-choice"
          },
          {
            question: "Which of the following is NOT typically a responsibility of a biomedical engineer?",
            options: ["A) Designing medical devices","B) Developing new pharmaceuticals","C) Working on prosthetics and implants","D) Improving healthcare technologies"],
            answer: "B) Developing new pharmaceuticals",
            difficulty: "medium",
            type: "multiple-choice"
          },
          {
            question: "What is a key societal impact of civil engineering in the context of urban development?",
            options: ["A) Advancing space exploration","B) Improving energy storage systems","C) Designing safe, functional, and efficient urban spaces","D) Developing software systems for healthcare"],
            answer: "C) Designing safe, functional, and efficient urban spaces",
            difficulty: "medium",
            type: "multiple-choice"
          },
          // True/False Questions
          {
            question: 'Engineers play an essential role in solving complex societal problems such as climate change.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineering solutions always prioritize profit over environmental sustainability.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'In the context of engineering, ethics primarily concerns the protection of intellectual property.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'The development of artificial intelligence (AI) is an important aspect of modern engineering.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineering advancements have had little impact on the global economy.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineers have no responsibility to consider the environmental impact of their work.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'The primary function of an engineer is to solve technical problems, without regard for social consequences.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Renewable energy engineering is a growing field that focuses on designing sustainable energy systems.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineers must always prioritize cost savings over safety when making decisions about product design.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'A civil engineer’s work typically focuses on structures, transportation systems, and public infrastructure.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'All engineers must adhere to the same ethical standards, regardless of their field of specialization.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Environmental engineers focus solely on creating pollution-control systems without considering other aspects of sustainability.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineers working in technology and software development have no role in contributing to social welfare.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'The impact of engineering on society is often seen through improved living standards, safer environments, and new technologies.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Ethics in engineering can be disregarded if it conflicts with the company’s bottom line.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineering advancements are a major driver of global technological and economic progress.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineers working on projects involving human health do not need to consider safety and regulatory standards.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineering innovation plays a crucial role in tackling global challenges such as climate change and resource scarcity.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineers have an ethical obligation to prioritize public safety over personal or financial interests.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Automation and artificial intelligence have little impact on the future of engineering jobs and industries.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'The engineering profession is solely concerned with the technical aspects of design, not the societal or cultural impacts.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineers are not responsible for considering the ethical implications of their work as long as they follow legal regulations.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'The role of engineers in society includes addressing sustainability challenges and minimizing environmental impacts.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineers working in developing countries should adhere to the same safety and quality standards as those in developed countries.',
            answer: 'True',
            difficulty: 'easy',
            type: 'true-false'
          },
          {
            question: 'Engineers can ignore the social and cultural contexts of their work if they believe the technology will improve efficiency.',
            answer: 'False',
            difficulty: 'easy',
            type: 'true-false'
          },
          // Fill-in Questions
          {
            question: 'The branch of engineering that focuses on designing and constructing infrastructure, such as roads, bridges, and buildings, is called ____ engineering.',
            answer: 'Civil',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The process of converting raw materials into finished products is known as ____ engineering.',
            answer: 'Manufacturing',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The discipline of engineering that focuses on the study and application of electrical systems and devices is called ____ engineering.',
            answer: 'Electrical',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'In engineering, the systematic analysis of a system’s functions, structures, and performance is known as ____ engineering.',
            answer: 'Systems',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The study of forces, energy, and material properties that contribute to the motion of objects is known as ____ engineering.',
            answer: 'Mechanical',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'A civil engineer is designing a bridge that will support a maximum load of 10,000 N. If the bridge has a total of 5 support beams, how much load should each beam be designed to carry? (Assume the load is evenly distributed.)',
            answer: '2000',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'A mechanical engineer needs to calculate the work done when a force of 300 N moves an object 5 meters in the direction of the force. What is the work done in joules?',
            answer: '1500',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'An electrical engineer is designing a circuit where the resistance is 10 ohms and the current is 5 A. Using Ohm’s law, what is the voltage across the circuit?',
            answer: '50',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'A chemical engineer is calculating the heat required to raise the temperature of 100 grams of water by 20°C. The specific heat capacity of water is 4.18 J/g°C. What is the total heat required in joules?',
            answer: '8360',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'A structural engineer is calculating the bending moment at the center of a simply supported beam with a point load of 500 N applied at the midpoint of a 6-meter span. What is the bending moment at the center of the beam?',
            answer: '1500',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'A software engineer is estimating the time complexity of an algorithm. If the algorithm performs 10 operations for each element in a dataset of size n, what is the time complexity of the algorithm?',
            answer: 'O(n)',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'An environmental engineer is determining the amount of CO2 emissions for a vehicle that burns 8 liters of fuel per 100 km. If the CO2 emission factor for the fuel is 2.31 kg CO2 per liter, how much CO2 is emitted after 150 km of driving?',
            answer: '276.6',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'A civil engineer needs to determine the required thickness of an asphalt layer for a road. If the total applied load is 500 kN and the modulus of elasticity of the material is 500 MPa, what is the required thickness of the layer assuming linear elasticity and uniform load distribution?',
            answer: '0.01',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'A mechanical engineer is calculating the stress on a material under a force of 800 N. If the cross-sectional area of the material is 4 cm², what is the stress applied to the material in pascals (Pa)?',
            answer: '20000',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'An aerospace engineer is calculating the speed of an aircraft in a wind tunnel. If the pressure difference across the aircraft is 1500 Pa and the air density is 1.225 kg/m³, what is the velocity of the aircraft assuming Bernoulli’s equation applies?',
            answer: '47.2',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The branch of engineering that focuses on designing and constructing infrastructure, such as roads, bridges, and buildings, is called ____ engineering.',
            answer: 'Civil',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The process of converting raw materials into finished products is known as ____ engineering.',
            answer: 'Manufacturing',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The discipline of engineering that focuses on the study and application of electrical systems and devices is called ____ engineering.',
            answer: 'Electrical',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'In engineering, the systematic analysis of a system’s functions, structures, and performance is known as ____ engineering.',
            answer: 'Systems',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The study of forces, energy, and material properties that contribute to the motion of objects is known as ____ engineering.',
            answer: 'Mechanical',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The branch of engineering that deals with the design, construction, and operation of machinery is called ____ engineering.',
            answer: 'Mechanical',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The field of engineering that focuses on the design and application of computers and software systems is known as ____ engineering.',
            answer: 'Computer',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The branch of engineering that focuses on the development of energy systems, including renewable energy sources, is called ____ engineering.',
            answer: 'Energy',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The discipline of engineering concerned with the design and operation of transportation systems is known as ____ engineering.',
            answer: 'Transportation',
            difficulty: 'hard',
            type: 'fill-in'
          },
          {
            question: 'The study of designing and managing complex systems in industries such as aerospace and defense is known as ____ engineering.',
            answer: 'Aerospace',
            difficulty: 'hard',
            type: 'fill-in'
          }
        ],
      },
    {
      id: 'CHE-251',
      programOfStudy: 'Chemical Engineering',
      levelOfStudy: 'Level 200',
      semesterOfStudy: 'Semester 1',
      title: 'Chemical Process Calculations I',
      description: 'An introduction to the basic principles of chemical process calculations, thermodynamics, and fluid mechanics.',
      questions: [
        // Fill-in Questions
        {
          question: "What is the formula to calculate the mass flow rate in a chemical process? Mass Flow Rate = ......",
          answer: "Density × Velocity × Area",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "What is the ideal gas law equation used in chemical process calculations?",
          answer: "PV = nRT",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "What does the term 'enthalpy' refer to in thermodynamics?",
          answer: "Enthalpy is the total heat content of a system.",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "In a chemical reaction, what is the purpose of a material balance?",
          answer: "A material balance is used to ensure the conservation of mass in the process.",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "What is the difference between molar and mass flow rates in a chemical process?",
          answer: "Molar flow rate refers to the number of moles of a substance passing per unit time, while mass flow rate refers to the mass of a substance passing per unit time.",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "If 200 kg of a substance is processed every hour, and the molecular weight of the substance is 50 g/mol, what is the molar flow rate in moles per hour?",
          answer: "4000",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "The heat capacity of a system is 250 J/°C. If the system undergoes a temperature change of 20°C, how much heat is required?",
          answer: "5000",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "If 5 m³ of gas at 300 K and 1 atm pressure is heated to 500 K, what is the new volume assuming ideal gas behavior? (Use Charles' Law: V1/T1 = V2/T2)",
          answer: "8.33",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "In a chemical process, if the flow rate of a liquid is 2 L/min and its density is 0.9 g/cm³, what is the mass flow rate in grams per minute?",
          answer: "1800",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "If a heat exchanger removes 5000 W of heat from a fluid with a specific heat of 4.2 kJ/kg°C, and the flow rate is 2 kg/s, what is the temperature change of the fluid?",
          answer: "0.595",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "A chemical reactor processes 10,000 kg of feed per day. The feed contains 30% by weight of the desired product. What is the mass of the desired product produced per day?",
          answer: "3000",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "If a heat exchanger has a flow rate of 0.5 m³/s and the temperature of the incoming fluid is 200°C, while the outgoing fluid temperature is 100°C, how much heat is transferred if the specific heat of the fluid is 3.5 kJ/kg°C and the fluid density is 800 kg/m³?",
          answer: "140000",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "In a distillation column, if the liquid flow rate is 1000 L/min and the vapor flow rate is 800 L/min, what is the vapor-liquid ratio?",
          answer: "0.8",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "For a chemical reaction with a reaction rate constant (k) of 0.02 s⁻¹, and a concentration of 5 mol/L, what is the reaction rate?",
          answer: "0.1",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "A gas is compressed in a piston. If the initial volume is 3 m³, the initial pressure is 100 kPa, and the final pressure is 200 kPa, what is the final volume of the gas if the process is isothermal?",
          answer: "1.5",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "If a reactor operates at 80% efficiency and processes 5000 m³ of gas per hour, what is the effective volume of gas being processed per hour?",
          answer: "4000",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "A chemical reaction occurs at a rate constant (k) of 0.5 h⁻¹. If the initial concentration is 0.1 mol/L, what will the concentration be after 3 hours in a first-order reaction?",
          answer: "0.025",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "If a mixer is blending two streams of fluids with flow rates of 2 L/s and 3 L/s, and their respective concentrations of a substance are 10 mol/L and 5 mol/L, what is the concentration of the substance in the mixed stream?",
          answer: "7",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "A chemical plant uses a heat pump to heat a process stream. If the heat pump provides 20 kW of heat and the stream has a flow rate of 4 kg/s with a specific heat of 3 kJ/kg°C, by how many degrees will the temperature of the stream increase?",
          answer: "1.67",
          difficulty: "hard",
          type: "fill-in"
        },
        {
          question: "In a batch distillation process, 1500 kg of a mixture with a boiling point of 78°C is heated at a rate of 5 kW. How much time will it take to distill the entire mixture, assuming no losses and perfect separation?",
          answer: "300",
          difficulty: "hard",
          type: "fill-in"
        },
        // True/False Questions
        {
          question: "The ideal gas law can only be applied to gases under low pressure and high temperature.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "A material balance for a system always ensures that the total mass entering equals the total mass leaving.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "In a steady-state process, the mass accumulation term in the material balance is zero.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The volume of an ideal gas is directly proportional to its temperature at constant pressure.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The mass flow rate of a substance in a chemical process is the product of its density, velocity, and pressure.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The ideal gas law can be applied to liquids and solids as well as gases.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "A positive value of enthalpy change indicates that a reaction is exothermic.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "In a chemical process, the rate of reaction typically increases with temperature.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "A system in thermodynamic equilibrium will have no net flow of energy or matter.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The molar flow rate is equal to the mass flow rate divided by the molar mass of the substance.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "In a batch process, the mass flow rate of a feed stream entering the system remains constant over time.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "For an ideal fluid, the viscosity is independent of the fluid’s velocity and temperature.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The enthalpy of a substance increases when it undergoes an isothermal expansion.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "For an ideal gas, the volume is inversely proportional to the pressure when the temperature is held constant.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The heat required to raise the temperature of a substance is calculated using the formula Q = mcΔT, where Q is the heat, m is the mass, c is the specific heat, and ΔT is the temperature change.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "In a first-order reaction, the rate constant has units of time⁻¹.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "A chemical process is at equilibrium when the concentration of reactants and products is equal.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The total mass of a system in a material balance remains constant if no external mass is added or removed.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "If a fluid with a density of 1.2 g/cm³ and a velocity of 3 m/s flows through a pipe with a cross-sectional area of 0.2 m², the mass flow rate is 720 kg/s.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "If the pressure of a gas is doubled while keeping the temperature constant, its volume will also double.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The reaction rate in a zero-order reaction is constant and does not depend on the concentration of reactants.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "In a batch reactor, the volume of the reactor increases as the reaction proceeds if the reaction produces a gaseous product.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        // Multiple-Choice Questions
        {
          question: "Which of the following is the correct equation for calculating the energy balance in a chemical process?",
          options: ["A) ΔH = Q - W","B) ΔH = Q + W","C) ΔU = Q - W","D) ΔU = Q + W"],
          answer: "A) ΔH = Q - W",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following statements best describes the First Law of Thermodynamics?",
          options: ["A) Energy can be created but not destroyed.","B) Energy can neither be created nor destroyed, only transformed.","C) The entropy of a system remains constant.","D) Energy can be destroyed but not created."],
          answer: "B) Energy can neither be created nor destroyed, only transformed.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "In a chemical process, what is the primary purpose of a heat exchanger?",
          options: ["A) To speed up the chemical reaction.","B) To separate two immiscible liquids.","C) To transfer heat from one fluid to another.","D) To increase the pressure of a gas."],
          answer: "C) To transfer heat from one fluid to another.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the definition of molar flow rate in a chemical process?",
          options: ["A) The total number of moles passing through a system per unit time.","B) The volume of gas passing through a system per unit time.","C) The mass of the substance passing through the system per unit time.","D) The total energy passing through the system per unit time."],
          answer: "A) The total number of moles passing through a system per unit time.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following statements is true about a simple distillation process?",
          options: ["A) It is used to separate components with very similar boiling points.","B) It is used for separating components with a large difference in boiling points.","C) It requires a catalyst to be efficient.","D) It is only effective for separating solid mixtures."],
          answer: "B) It is used for separating components with a large difference in boiling points.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following factors does **not** affect the rate of a chemical reaction?",
          options: ["A) Temperature","B) Pressure","C) Concentration of reactants","D) The color of the reactants"],
          answer: "D) The color of the reactants",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following is a characteristic of a first-order reaction?",
          options: ["A) The rate of reaction is proportional to the square of the concentration of the reactant.","B) The rate of reaction is proportional to the concentration of the reactant.","C) The rate of reaction is independent of the concentration of the reactant.","D) The rate of reaction depends on the temperature but not the concentration."],
          answer: "B) The rate of reaction is proportional to the concentration of the reactant.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "In a **continuous** stirred tank reactor (CSTR), the flow rate of the input stream is equal to the flow rate of the output stream in a steady-state operation. What happens if the input concentration is increased?",
          options: ["A) The output concentration will remain the same.","B) The output concentration will decrease.","C) The output concentration will increase.","D) The reaction will stop."],
          answer: "C) The output concentration will increase.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following processes is most commonly used to separate a mixture of liquids with **very similar boiling points**?",
          options: ["A) Simple distillation","B) Fractional distillation","C) Membrane filtration","D) Adsorption"],
          answer: "B) Fractional distillation",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "In a **material balance** for a chemical process, which of the following terms represents the mass of input material minus the mass of output material?",
          options: ["A) Accumulation","B) Reaction","C) Generation","D) Consumption"],
          answer: "A) Accumulation",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following is **not** a typical application of **pneumatic conveying** in a chemical plant?",
          options: ["A) Transporting solid particles over long distances","B) Moving gases or vapors through pipes","C) Transferring liquids in pumps","D) Moving powders from one section of the plant to another"],
          answer: "C) Transferring liquids in pumps",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What does the **Reynolds number** in fluid mechanics indicate?",
          options: ["A) The flow velocity of a fluid","B) The efficiency of a pump","C) The type of fluid flow (laminar or turbulent)","D) The pressure drop in a pipe"],
          answer: "C) The type of fluid flow (laminar or turbulent)",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following best describes the process of **electrolysis** in a chemical plant?",
          options: ["A) The process of heating a substance until it breaks down into its components.","B) The use of electric current to drive a non-spontaneous chemical reaction.","C) The separation of components by a chemical membrane.","D) The process of mixing two chemicals to form a reaction."],
          answer: "B) The use of electric current to drive a non-spontaneous chemical reaction.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following is the **main difference** between **batch** and **continuous** processes?",
          options: ["A) Batch processes operate continuously while continuous processes work in batches.","B) Batch processes have a fixed input and output, while continuous processes do not.","C) Batch processes are more energy-efficient than continuous processes.","D) Continuous processes operate without interruption, while batch processes are operated intermittently."],
          answer: "D) Continuous processes operate without interruption, while batch processes are operated intermittently.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the purpose of a **heat exchanger** in chemical processing?",
          options: ["A) To increase the temperature of fluids","B) To remove heat from a fluid","C) To transfer heat between two fluids at different temperatures","D) To generate power from thermal energy"],
          answer: "C) To transfer heat between two fluids at different temperatures",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the flow rate in cubic meters per second (m³/s) for a pipe carrying water if the area of cross-section is 0.5 m² and the flow velocity is 2 m/s?",
          options: ["A) 1 m³/s","B) 2 m³/s","C) 0.5 m³/s","D) 0.25 m³/s"],
          answer: "B) 1 m³/s",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the molecular weight of CO₂ (Carbon Dioxide)?",
          options: ["A) 44 g/mol","B) 32 g/mol","C) 28 g/mol","D) 18 g/mol"],
          answer: "A) 44 g/mol",
          difficulty: "easy",
          type: "multiple-choice"
        },
        {
          question: "In a reaction, if the rate constant (k) is 0.02 s⁻¹ and the concentration of the reactant is 3 mol/L, what is the rate of reaction for a first-order reaction?",
          options: ["A) 0.06 mol/L.s","B) 0.02 mol/L.s","C) 0.03 mol/L.s","D) 0.06 mol/L"],
          answer: "A) 0.06 mol/L.s",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the **mass flow rate** in kg/s of a substance with a density of 1.2 g/cm³, velocity of 5 m/s, and a pipe area of 0.3 m²?",
          options: ["A) 1.8 kg/s","B) 3.6 kg/s","C) 0.6 kg/s","D) 6 kg/s"],
          answer: "A) 1.8 kg/s",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "The heat required to raise the temperature of a substance can be calculated using Q = mcΔT. If m = 5 kg, c = 4.18 kJ/kg°C, and ΔT = 10°C, what is the heat required?",
          options: ["A) 209 kJ","B) 2090 kJ","C) 418 kJ","D) 100 kJ"],
          answer: "A) 209 kJ",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following describes the relationship between the volume and pressure of an ideal gas, according to Boyle’s Law?",
          options: ["A) Volume is inversely proportional to pressure.","B) Volume is directly proportional to pressure.","C) Volume is constant regardless of pressure.","D) Volume is directly proportional to the square of pressure."],
          answer: "A) Volume is inversely proportional to pressure.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the **Reynolds number** for a fluid with a velocity of 2 m/s, density of 1000 kg/m³, and dynamic viscosity of 0.001 Pa.s in a pipe with a diameter of 0.05 m?",
          options: ["A) 1000","B) 2000","C) 5000","D) 10000"],
          answer: "B) 2000",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "In a chemical process, if the feed stream has a mass flow rate of 150 kg/s and the product stream has a mass flow rate of 120 kg/s, what is the mass flow rate of the waste stream?",
          options: ["A) 30 kg/s","B) 150 kg/s","C) 120 kg/s","D) 270 kg/s"],
          answer: "A) 30 kg/s",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "A chemical reaction has a rate constant of 0.1 L/(mol·s) and the concentration of reactant A is 0.5 mol/L. What is the rate of the reaction for a second-order reaction?",
          options: ["A) 0.05 mol/L.s","B) 0.1 mol/L.s","C) 0.025 mol/L.s","D) 0.5 mol/L.s"],
          answer: "A) 0.05 mol/L.s",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "In a chemical process, what happens if the residence time of a substance in a reactor is increased while keeping other factors constant?",
          options: ["A) The reaction rate increases.","B) The reaction rate decreases.","C) The conversion of reactants to products increases.","D) The conversion of reactants to products decreases."],
          answer: "C) The conversion of reactants to products increases.",
          difficulty: "medium",
          type: "multiple-choice"
        }
      ],
    },
    {
      id: 'CHE-253',
      programOfStudy: 'Chemical Engineering',
      levelOfStudy: 'Level 200',
      semesterOfStudy: 'Semester 1',
      title: 'Chemical Engineering Thermodynamics I',
      description: 'A foundational course on the principles of thermodynamics, focusing on energy, enthalpy, entropy, and phase equilibria.',
      questions: [
        // Multiple-Choice Questions
        {
          question: "Which of the following is the correct expression for the first law of thermodynamics?",
          options: ["A) ΔU = Q + W","B) ΔU = Q - W","C) ΔU = W + PΔV","D) ΔH = ΔU + PΔV"],
          answer: "B) ΔU = Q - W",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          "question": "The efficiency of a heat engine is given by the formula: η = 1 - (Tc / Th). What do Tc and Th represent in this formula?",
          "options": ["A) Tc is the temperature of the cold reservoir, and Th is the temperature of the hot reservoir.",  "B) Tc is the temperature of the hot reservoir, and Th is the temperature of the cold reservoir.","C) Tc is the heat transferred, and Th is the work done.","D) Tc and Th are both constant temperatures."],
          "answer": "A) Tc is the temperature of the cold reservoir, and Th is the temperature of the hot reservoir.",
          "difficulty": "medium",
          "type": "multiple-choice"
        },      
        {
          question: "Which property is used to measure the heat content of a system at constant pressure?",
          options: ["A) Enthalpy","B) Entropy","C) Internal Energy","D) Free Energy"],
          answer: "A) Enthalpy",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which law of thermodynamics states that energy cannot be created or destroyed, only converted from one form to another?",
          options: ["A) First Law of Thermodynamics","B) Second Law of Thermodynamics","C) Third Law of Thermodynamics","D) Zeroth Law of Thermodynamics"],
          answer: "A) First Law of Thermodynamics",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following is the **unit of enthalpy**?",
          options: ["A) Joules (J)","B) Calories (cal)","C) Kelvin (K)","D) Pascals (Pa)"],
          answer: "A) Joules (J)",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "In thermodynamics, which of the following describes the change in energy due to a temperature change in a substance?",
          options: ["A) Enthalpy","B) Heat capacity","C) Entropy","D) Work"],
          answer: "B) Heat capacity",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "The process of transferring heat from a hot object to a cold one until both reach the same temperature is called?",
          options: ["A) Isobaric process","B) Isochoric process","C) Thermal equilibrium","D) Adiabatic process"],
          answer: "C) Thermal equilibrium",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "In an adiabatic process, which of the following holds true?",
          options: ["A) Heat exchange occurs with the surroundings.","B) No heat is exchanged with the surroundings.","C) Work done by the system is zero.","D) The temperature remains constant."],
          answer: "B) No heat is exchanged with the surroundings.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "The second law of thermodynamics states that the entropy of an isolated system always...",
          options: ["A) Decreases","B) Increases","C) Remains constant","D) Depends on the temperature"],
          answer: "B) Increases",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the term used for the energy required to raise the temperature of 1 kg of a substance by 1 degree Celsius?",
          options: ["A) Specific heat capacity","B) Latent heat","C) Work done","D) Enthalpy"],
          answer: "A) Specific heat capacity",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following processes occurs at **constant pressure**?",
          options: ["A) Isochoric process","B) Isobaric process","C) Adiabatic process","D) Isothermal process"],
          answer: "B) Isobaric process",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following terms refers to the amount of disorder or randomness in a system?",
          options: ["A) Enthalpy","B) Entropy","C) Internal energy","D) Heat"],
          answer: "B) Entropy",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the standard state for a substance in thermodynamics?",
          options: ["A) The state of the substance at high pressure and temperature","B) The state of the substance at 1 bar pressure and 298 K","C) The state of the substance at 0 K","D) The state of the substance at 1 atm pressure and 0°C"],
          answer: "B) The state of the substance at 1 bar pressure and 298 K",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following is true for an ideal gas?",
          options: ["A) The intermolecular forces are significant.","B) The gas behaves in accordance with the ideal gas law at all temperatures and pressures.","C) The volume of the gas molecules is considered to be negligible.","D) The gas cannot be compressed."],
          answer: "C) The volume of the gas molecules is considered to be negligible.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What does the Gibbs free energy (G) indicate about a chemical reaction?",
          options: ["A) It represents the total energy available in a system.","B) If ΔG < 0, the reaction is non-spontaneous.","C) If ΔG > 0, the reaction is spontaneous.","D) If ΔG = 0, the system is at equilibrium."],
          answer: "D) If ΔG = 0, the system is at equilibrium.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following statements is true for an isothermal process?",
          options: ["A) The temperature remains constant, and the internal energy changes.","B) The temperature remains constant, and no heat is exchanged.","C) The temperature changes, and the system does work.","D) The temperature remains constant, and heat is exchanged with the surroundings."],
          answer: "D) The temperature remains constant, and heat is exchanged with the surroundings.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which equation represents the relationship between enthalpy and internal energy for an ideal gas?",
          options: ["A) H = U + PV","B) H = U - PV","C) H = U + RT","D) H = U - RT"],
          answer: "A) H = U + PV",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the term used to describe the heat required to raise the temperature of a substance by one degree?",
          options: ["A) Heat capacity","B) Specific heat","C) Enthalpy","D) Latent heat"],
          answer: "B) Specific heat",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "Which of the following is a characteristic of a reversible reaction in thermodynamics?",
          options: ["A) The reaction proceeds without any energy change.","B) The reaction can proceed in both directions under appropriate conditions.","C) The reaction is spontaneous in one direction only.","D) The reaction does not reach equilibrium."],
          answer: "B) The reaction can proceed in both directions under appropriate conditions.",
          difficulty: "medium",
          type: "multiple-choice"
        },
        {
          question: "What is the term for the change in enthalpy that occurs when a substance undergoes a phase transition?",
          options: ["A) Latent heat","B) Sensible heat","C) Specific heat","D) Free energy"],
          answer: "A) Latent heat",
          difficulty: "medium",
          type: "multiple-choice"
        },
        // True/False Questions
        {
          question: "The second law of thermodynamics states that the entropy of an isolated system always increases.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "In a reversible adiabatic process, there is no change in entropy.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "In thermodynamics, the enthalpy change for an ideal gas depends only on the temperature change.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The third law of thermodynamics implies that it is impossible to reach absolute zero in a finite number of steps.",
          answer: "True",
          difficulty: "easy",
          type: "true-false"
        },
        {
          question: "The heat capacity of a substance increases as temperature decreases.",
          answer: "False",
          difficulty: "easy",
          type: "true-false"
        },
      {
        question: "The second law of thermodynamics states that the entropy of an isolated system always increases.",
        answer: "True",
        difficulty: "easy",
        type: "true-false"
      },
      {
        question: "In a reversible adiabatic process, there is no change in entropy.",
        answer: "True",
        difficulty: "easy",
        type: "true-false"
      },
      {
        question: "In thermodynamics, the enthalpy change for an ideal gas depends only on the temperature change.",
        answer: "True",
        difficulty: "easy",
        type: "true-false"
      },
      {
        question: "The third law of thermodynamics implies that it is impossible to reach absolute zero in a finite number of steps.",
        answer: "True",
        difficulty: "easy",
        type: "true-false"
      },
      {
        question: "The heat capacity of a substance increases as temperature decreases.",
        answer: "False",
        difficulty: "easy",
        type: "true-false"
      },
      // Fill-in Questions
      {
        question: "The change in the internal energy of a system is given by the equation ΔU = ____ + ____.",
        answer: "Q, W",
        difficulty: "hard",
        type: "fill-in"
      },
      {
        question: "The term used to describe the heat required to raise the temperature of one mole of a substance by one degree Celsius is called ____ heat capacity.",
        answer: "Molar",
        difficulty: "hard",
        type: "fill-in"
      },
      {
        question: "The heat transfer into or out of a system during a process is symbolized by the letter ____ in thermodynamics.",
        answer: "Q",
        difficulty: "hard",
        type: "fill-in"
      },
      {
        question: "In a reversible process, the entropy change of the system is related to heat by the equation ΔS = ____/T.",
        answer: "Q",
        difficulty: "hard",
        type: "fill-in"
      },
      {
        question: "The enthalpy change during a phase transition, such as melting or boiling, is called ____ heat.",
        answer: "Latent",
        difficulty: "hard",
        type: "fill-in"
      },
      ],
    },  
    {
      id: 'CHE-255',
      programOfStudy: 'Chemical Engineering',
      levelOfStudy: 'Level 200',
      semesterOfStudy: 'Semester 1',
      title: 'Fluid Transport',
      description: 'A course on the principles of fluid mechanics and transport processes in engineering systems.',
      questions: [
        // Multiple-Choice Questions (Medium Difficulty)
        {
          question: 'Which of the following is the primary factor that affects fluid flow in a pipe?',
          options: ['A) Temperature', 'B) Pressure difference', 'C) Pipe material', 'D) Fluid density'],
          answer: 'B) Pressure difference',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which type of flow is characterized by smooth, orderly fluid motion?',
          options: ['A) Turbulent flow', 'B) Laminar flow', 'C) Transitional flow', 'D) Rotational flow'],
          answer: 'B) Laminar flow',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'In a pipe, the velocity of the fluid is highest at which location?',
          options: ['A) Near the walls', 'B) At the center of the pipe', 'C) At the pipe’s entrance', 'D) At the pipe’s exit'],
          answer: 'B) At the center of the pipe',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is a method to measure fluid velocity in a pipe?',
          options: ['A) Venturi meter', 'B) Orifice plate', 'C) Pitot tube', 'D) All of the above'],
          answer: 'D) All of the above',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'What is the primary cause of head loss in a pipe?',
          options: ['A) Temperature changes', 'B) Frictional resistance', 'C) Pressure differences', 'D) Fluid viscosity'],
          answer: 'B) Frictional resistance',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The point in the immersed body through which the resultant pressure of the liquid may be taken to act is known as .....',
          options: ['A) Meta Center', 'B) Center of Pressure', 'C) Center of Buoyancy', 'D) Center of Gravity'],
          answer: 'B) Center of Pressure',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The total pressure on the surface of a vertical sluice gate 2m x 1m with its top 2m surface being 0.5m below the water level will be ...?',
          options: ['A) 500kg', 'B) 1000kg', 'C) 1500kg', 'D) 2000kg', 'E) 4000kg'],
          answer: 'D) 2000kg',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The resultant upward pressure of a fluid on a floating body is equal to the weight of the fluid displaced by the body. This defintion is according to ...?',
          options: ['A) Buoyancy', 'B) Equilibrium of a floating body', 'C) Archimedes Principle', 'D) Bernoullis theorem', 'E) Metacentric principle'],
          answer: 'C) Archimedes Principle',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The resultant upward pressure of the fluid on an immersed body is called ...?',
          options: ['A) Upthrust', 'B) Buoyancy', 'C) Center of pressure', 'D) All the above are correct', 'E) None of the above is correct'],
          answer: 'A) Upthrust',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The property by virtue of which a liquid opposes relative motion between its different layers is called',
          options: ['A) Surface Tension', 'B) Co-efficient of viscosity', 'C) Viscosity', 'D) Osmosis', 'E) Cohesion'],
          answer: 'C) Viscosity',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The process of diffusion of one liquid into the other through a semi-permeable membrane is called',
          options: ['A) Viscosity', 'B) Osmosis', 'C) Surface tension', 'D) Cohesion', 'E) Diffusivity'],
          answer: 'B) Osmosis',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The units of dynamic or absolute viscosity are ....',
          options: ['A) m^2/s', 'B) kg.s/m', 'C) N.s/m', 'D) N.s^2/m', 'E) None of the above is correct'],
          answer: 'C) N.s/m',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The continuity equation is connected with',
          options: ['A) Viscous/Unviscous fluids', 'B) Compressibility of fluids', 'C) Conservation of mass', 'D) Steady/Unsteady flow', 'E) Open channel/pipe flow'],
          answer: 'C) Conservation of mass',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The rise or depression of liquid in a tube due to surface tensionwim increase in size of tube will ....?',
          options: ['A) Increase', 'B) Remain unaffected', 'C) May increase or decrease depending on the characteristics of liquid', 'D) Decrease', 'E) Unpredictable'],
          answer: 'D) Decrease',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Liquids transmit pressure equally in all the directions. This is according to ....',
          options: ["A) Boyle's Law", 'B) Archimedes principle', "C) Pascal's Law", "D) Newton's formula", "E) Chezy's equation"],
          answer: "C) Pascal's Law",
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Capillary action is due to the ....',
          options: ['A) Surface tension', 'B) Cohesion of the liquid', 'C) Adhesion of the liquid molecules and the molecules on the surfaec of a solid', 'D) All the above are correct', 'E) None of the above is correct'],
          answer: 'D) All the above are correct',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: "Newton's law of viscosity is a relationship between ...........",
          options: ['A) Shear stress and the velocity gradient in a fluid', 'B) Shear stress and viscosity', 'C) Shear stress, velocity and viscosity', 'D) Pressure, velocity and viscosity', 'E) Shear stress, pressure and rate of angular distortion'],
          answer: 'A) Shear stress and the velocity gradient in a fluid',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The atmospheric pressure with rise in altitude decreases?',
          options: ['A) Linearly', 'B) First slowly and then steeply', 'C) First steeply and then gradually', 'D) Unpredictable', 'E) None of the above'],
          answer: 'B) First slowly and then steeply',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: "Pressure of the order of 10''' torr can be measured by",
          options: ['A) Bourdon tube', 'B) Pirani Gauge', 'C) Micro-manometer', 'D) Ionisation gauge', 'E) McLeod gauge'],
          answer: 'D) Ionisation gauge',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Operation of McLeod gauge used for low pressure measurement is based on the principle of',
          options: ['A) Gas Law', "B) Boyle's Law", 'C) Charles Law', "D) Pascal's law", "E) McLeod's law"],
          answer: "B) Boyle's Law",
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        // True/False Questions
        {
          question: 'Fluids always flow from areas of low pressure to high pressure.',
          answer: 'False',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'Turbulent flow occurs when the fluid moves in an irregular pattern with eddies.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'In laminar flow, fluid particles move in parallel layers with minimal mixing.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'The Reynolds number is used to predict the type of flow in a fluid system.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'The pressure at the center of a pipe is always higher than at the walls in laminar flow.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        // Fill-in Questions
        {
          question: 'The equation that describes the relationship between fluid velocity, pressure, and fluid density in a pipe is called the ____ equation.',
          answer: 'Bernoulli',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The process of energy loss in fluid flow due to frictional forces is referred to as ____ loss.',
          answer: 'head',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The ____ number is a dimensionless number used to predict flow patterns in fluid transport systems.',
          answer: 'Reynolds',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The Darcy-Weisbach equation is used to calculate ____ loss in pipe flow.',
          answer: 'frictional',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'In fluid dynamics, the law that describes the conservation of mass in a steady flow is called the ____ equation.',
          answer: 'continuity',
          difficulty: 'hard',
          type: 'fill-in'
        },
      ],
    },  
    {
      id: 'CHE-257',
      programOfStudy: 'Chemical Engineering',
      levelOfStudy: 'Level 200',
      semesterOfStudy: 'Semester 1',
      title: 'Analytical Chemistry for Engineers',
      description: 'A course focusing on the fundamental techniques and theories in analytical chemistry, specifically for engineers.',
      questions: [
        // Multiple-Choice Questions (Medium Difficulty)
        {
          question: 'Which of the following is the most common method for separating mixtures in analytical chemistry?',
          options: ['A) Chromatography','B) Titration','C) Spectroscopy','D) Filtration'],
          answer: 'A) Chromatography',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is NOT a type of chromatography?',
          options: ['A) Gas chromatography','B) Liquid chromatography','C) Electrochromatography','D) Membrane chromatography'],
          answer: 'D) Membrane chromatography',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which method is used to measure the concentration of ions in solution?',
          options: ['A) Ion chromatography','B) Flame photometry','C) Mass spectrometry','D) Atomic absorption spectroscopy'],
          answer: 'B) Flame photometry',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is a key principle of spectroscopy?',
          options: ['A) Absorption of electromagnetic radiation by matter','B) Measurement of fluid density','C) Determining the melting point of substances','D) Separation of mixtures based on boiling points'],
          answer: 'A) Absorption of electromagnetic radiation by matter',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following chemical elements is commonly analyzed using Atomic Absorption Spectroscopy?',
          options: ['A) Hydrogen','B) Carbon','C) Calcium','D) Oxygen'],
          answer: 'C) Calcium',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
    
        // True/False Questions (Easy Difficulty)
        {
          question: 'The pH scale ranges from 0 to 14, with 7 being neutral.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'In a titration, the endpoint is reached when the color change indicates the complete reaction of the analyte.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'Spectroscopy measures the change in mass of atoms and molecules.',
          answer: 'False',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'A buffer solution resists changes in pH when small amounts of acid or base are added.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'In a gravimetric analysis, the mass of the product is measured directly.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
    
        // Fill-in Questions (Hard Difficulty)
        {
          question: 'The process of separating components in a mixture based on their distribution between a stationary and a mobile phase is called ____.',
          answer: 'chromatography',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The instrument that measures the absorbance of light by a solution at a particular wavelength is called a ____.',
          answer: 'spectrophotometer',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'In analytical chemistry, the standard solution used in titration is called the ____ solution.',
          answer: 'titrant',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The process in which a substance is heated to remove water or solvents is known as ____.',
          answer: 'drying',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'A method of separating ions based on their different affinity for a solid surface is known as ____.',
          answer: 'adsorption',
          difficulty: 'hard',
          type: 'fill-in'
        },
      ],
    },  
    {
      id: 'CHE-259',
      programOfStudy: 'Chemical Engineering',
      levelOfStudy: 'Level 200',
      semesterOfStudy: 'Semester 1',
      title: 'Chemical Process Industries',
      description: 'A course covering the various chemical processes used in industrial applications, including the principles and technologies behind chemical production.',
      questions: [
        // Multiple-Choice Questions (Medium Difficulty)
        {
          question: 'Which of the following processes is used for separating a liquid mixture into its components based on boiling points?',
          options: ['A) Distillation','B) Filtration','C) Adsorption','D) Absorption'],
          answer: 'A) Distillation',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which is the primary raw material for the production of sulfuric acid in the contact process?',
          options: ['A) Sulfur','B) Nitrogen','C) Water','D) Oxygen'],
          answer: 'A) Sulfur',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'What is the key chemical process in the production of ammonia for fertilizers?',
          options: ['A) Haber-Bosch process','B) Contact process','C) Fischer-Tropsch synthesis','D) Chlor-alkali process'],
          answer: 'A) Haber-Bosch process',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is NOT typically produced in petrochemical industries?',
          options: ['A) Ethylene','B) Propylene','C) Methanol','D) Sulfur'],
          answer: 'D) Sulfur',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The production of ethylene oxide primarily uses which type of reactor?',
          options: ['A) Fluidized bed reactor','B) Batch reactor','C) Continuous stirred-tank reactor','D) Fixed-bed reactor'],
          answer: 'D) Fixed-bed reactor',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is an example of a batch process in the chemical industry?',
          options: ['A) Oil refining','B) Pharmaceutical production','C) Cement production','D) Ethanol fermentation'],
          answer: 'B) Pharmaceutical production',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is a byproduct of the chlorine-alkali process?',
          options: ['A) Hydrogen','B) Oxygen','C) Methanol','D) Ethylene'],
          answer: 'A) Hydrogen',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'In the production of sulfuric acid, the contact process uses which gas as the starting material?',
          options: ['A) Nitrogen dioxide','B) Oxygen','C) Sulfur dioxide','D) Ammonia'],
          answer: 'C) Sulfur dioxide',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following chemicals is commonly used to produce synthetic rubber?',
          options: ['A) Butadiene','B) Acetylene','C) Ethylene','D) Methane'],
          answer: 'A) Butadiene',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The primary use of methanol in the chemical process industries is as a precursor for the production of ____.',
          options: ['A) Acetone','B) Formaldehyde','C) Acetic acid','D) Ethanol'],
          answer: 'B) Formaldehyde',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        // True/False Questions (Easy Difficulty)
        {
          question: 'The Haber-Bosch process is used for the production of ammonia.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'Distillation is used to separate components based on their densities.',
          answer: 'False',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'Polyethylene is commonly produced using the Ziegler-Natta catalyst.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'The primary product of the contact process is sulfur dioxide.',
          answer: 'False',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'Fertilizer-grade ammonia is produced by combining nitrogen and hydrogen in a 1:3 molar ratio.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
    
        // Fill-in Questions (Hard Difficulty)
        {
          question: 'The process used for the production of ammonia from nitrogen and hydrogen is known as the ____ process.',
          answer: 'Haber-Bosch',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The reaction of sulfur dioxide with oxygen in the contact process to form sulfur trioxide is catalyzed by ____.',
          answer: 'vanadium oxide',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'In the production of ethylene, the catalytic cracking of petroleum produces ethylene at high temperatures above ____°C.',
          answer: '800',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The primary feedstock for producing phenol in the chemical industry is ____.',
          answer: 'benzene',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The electrolysis of sodium chloride (NaCl) produces chlorine gas, sodium hydroxide, and ____ gas.',
          answer: 'hydrogen',
          difficulty: 'hard',
          type: 'fill-in'
        },
      ]
    },  
    {
      id: 'CHE-261',
      programOfStudy: 'Chemical Engineering',
      levelOfStudy: 'Level 200',
      semesterOfStudy: 'Semester 1',
      title: 'Computer Applications for Engineers',
      description: 'A course focusing on the use of computer applications and software tools essential for engineering practices, including programming, simulations, and data analysis.',
      questions: [
        // Multiple-Choice Questions (Medium Difficulty)
        {
          question: 'Which programming language is commonly used for engineering simulations and numerical computations?',
          options: ['A) Python','B) C++','C) MATLAB','D) Java'],
          answer: 'C) MATLAB',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'What is the primary function of CAD (Computer-Aided Design) software?',
          options: ['A) To create and modify technical drawings','B) To analyze fluid dynamics','C) To write source code for simulations','D) To manage project schedules'],
          answer: 'A) To create and modify technical drawings',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is a common operating system used in engineering workstations?',
          options: ['A) Linux','B) Windows 95','C) macOS','D) Android'],
          answer: 'A) Linux',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'In computer programming, which type of loop is typically used to repeat a task a set number of times?',
          options: ['A) If loop','B) For loop','C) While loop','D) Switch case loop'],
          answer: 'B) For loop',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is an example of a software application used for finite element analysis?',
          options: ['A) ANSYS','B) AutoCAD','C) SolidWorks','D) Excel'],
          answer: 'A) ANSYS',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is a version control system commonly used in collaborative software development?',
          options: ['A) Git','B) Java','C) MATLAB','D) C++'],
          answer: 'A) Git',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'What does the acronym "API" stand for in software development?',
          options: ['A) Application Programming Interface','B) Automated Process Integration','C) Advanced Programming Instruction','D) Application Process Instance'],
          answer: 'A) Application Programming Interface',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following programming languages is often used for real-time control systems?',
          options: ['A) JavaScript','B) C++','C) Python','D) Ruby'],
          answer: 'B) C++',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which type of software is commonly used to simulate the behavior of electrical circuits?',
          options: ['A) SPICE','B) AutoCAD','C) Excel','D) MATLAB'],
          answer: 'A) SPICE',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which software is most widely used for 3D modeling and design in engineering?',
          options: ['A) SolidWorks','B) WordPress','C) PowerPoint','D) Excel'],
          answer: 'A) SolidWorks',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        // True/False Questions (Easy Difficulty)
        {
          question: 'MATLAB is a widely used programming language for mathematical modeling and simulation in engineering.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'Python is only used for web development and not for engineering applications.',
          answer: 'False',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'The primary purpose of Excel is for creating 2D and 3D graphics in engineering design.',
          answer: 'False',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'A CAD program can be used to design both 2D and 3D objects.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'Simulations in engineering applications can be used to predict the behavior of systems before physical testing.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
    
        // Fill-in Questions (Hard Difficulty)
        {
          question: 'The programming language commonly used for scripting in AutoCAD is ____.',
          answer: 'LISP',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The simulation software commonly used for fluid flow and heat transfer analysis in engineering is ____.',
          answer: 'ANSYS Fluent',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'In object-oriented programming, the concept of grouping data and functions into a single entity is called a ____.',
          answer: 'class',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The computational tool used for solving systems of linear equations in numerical methods is called ____.',
          answer: 'Gaussian elimination',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'In the context of computer programming, the data structure used to store key-value pairs is called a ____.',
          answer: 'hash table',
          difficulty: 'hard',
          type: 'fill-in'
        },
      ]
    },  
    {
      id: 'MATH-251',
      programOfStudy: 'Chemical Engineering',
      levelOfStudy: 'Level 200',
      semesterOfStudy: 'Semester 1',
      title: 'Differential Equations',
      description: 'A course that covers the methods and applications of solving differential equations, including ordinary and partial equations.',
      questions: [
        // Multiple-Choice Questions (Medium Difficulty)
        {
          question: 'What is the general solution to the first-order differential equation dy/dx = 3x^2?',
          options: ['A) y = x^3 + C','B) y = 3x^3 + C','C) y = x^2 + C','D) y = 3x^2 + C'],
          answer: 'A) y = x^3 + C',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is an example of a second-order linear differential equation?',
          options: ['A) y" + 3y = 0','B) y" + y = e^x','C) y" + 4y = sin(x)','D) All of the above'],
          answer: 'D) All of the above',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The method of solving linear ordinary differential equations using an integrating factor is applicable to which type of equation?',
          options: ['A) Linear equations with constant coefficients','B) First-order linear differential equations','C) Nonlinear equations','D) Homogeneous equations'],
          answer: 'B) First-order linear differential equations',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which of the following is NOT a method of solving second-order linear differential equations?',
          options: ['A) Separation of variables','B) The method of undetermined coefficients','C) Variation of parameters','D) Laplace transforms'],
          answer: 'A) Separation of variables',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The characteristic equation of a differential equation is derived from the homogeneous form of the equation.',
          options: ['A) True','B) False'],
          answer: 'A) True',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: "The equation y'' + 4y = 0 has a solution of the form y = e^(kx). What is the value of k?",
          options: ['A) ±2i','B) ±4i','C) ±2','D) ±4'],
          answer: 'B) ±4i',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'Which method is commonly used to solve higher-order linear differential equations with constant coefficients?',
          options: ['A) Series solutions','B) Variation of parameters','C) Direct integration','D) Method of undetermined coefficients'],
          answer: 'D) Method of undetermined coefficients',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The solution to a homogeneous second-order linear differential equation is typically expressed as a ____.',
          options: ['A) Sum of two independent solutions','B) Single solution with arbitrary constants','C) Fourier series expansion','D) Polynomial function'],
          answer: 'A) Sum of two independent solutions',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'In which case does the method of separation of variables fail for solving a differential equation?',
          options: ['A) When the equation is linear','B) When both variables appear in the derivative term','C) When the equation is nonlinear','D) When there is a boundary condition'],
          answer: 'B) When both variables appear in the derivative term',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        {
          question: 'The method of variation of parameters is used to find the particular solution to a ____ equation.',
          options: ['A) Homogeneous','B) Non-homogeneous','C) Linear','D) Nonlinear'],
          answer: 'B) Non-homogeneous',
          difficulty: 'medium',
          type: 'multiple-choice'
        },
        // True/False Questions (Easy Difficulty)
        {
          question: 'The general solution to a first-order linear differential equation always involves an arbitrary constant.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'The Laplace transform is a method used for solving differential equations that are difficult to solve in the time domain.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'The solution to a differential equation is always a unique function.',
          answer: 'False',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'Separation of variables can be used to solve nonlinear differential equations.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
        {
          question: 'An ordinary differential equation involves one independent variable.',
          answer: 'True',
          difficulty: 'easy',
          type: 'true-false'
        },
    
        // Fill-in Questions (Hard Difficulty)
        {
          question: "The solution to the second-order linear differential equation y'' + p(x)y' + q(x)y = 0 is called the ____ of the equation.",
          answer: 'general solution',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'In the method of undetermined coefficients, the particular solution to a non-homogeneous equation is found by assuming a solution of the form ____.',
          answer: 'a linear combination of functions',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'A partial differential equation that involves both time and space variables is called a ____ equation.',
          answer: 'time-dependent',
          difficulty: 'hard',
          type: 'fill-in'
        },
        {
          question: 'The solution to the differential equation dy/dx = y is ____.',
          answer: 'y = Ce^x',
          difficulty: 'hard',
          type: 'fill-in'
        },     
      ]
    }
  ]  